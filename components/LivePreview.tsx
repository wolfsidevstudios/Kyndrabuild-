
import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import type { FileNode } from '../types';

declare const Babel: any;

interface LivePreviewProps {
  files: Map<string, FileNode>;
  entryPoint: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ files, entryPoint }) => {
  const [error, setError] = useState<string | null>(null);
  const [compiledCode, setCompiledCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  const fileContents = useMemo(() => {
    return Array.from(files.values())
      // FIX: Explicitly type `f` as FileNode to resolve issue where it was being inferred as `unknown`.
      .filter((f: FileNode) => f.type === 'file' && f.content)
      .map((f: FileNode) => ({ path: f.path, content: f.content! }));
  }, [files]);
  
  const debouncedFileContents = useDebounce(fileContents, 500);

  useEffect(() => {
    const compile = async () => {
      if (typeof Babel === 'undefined') {
        setError("Babel is not loaded.");
        return;
      }

      setError(null);

      const requireBoilerplate = `
        const modules = {};
        const externals = {
          'react': window.React,
          'react-dom': window.ReactDOM
        };

        // Helper to resolve relative paths
        const resolvePath = (base, relative) => {
          const stack = base.split('/');
          stack.pop(); // remove filename to get directory
          const parts = relative.split('/');
          for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
              if (stack.length > 0) stack.pop();
            } else {
              stack.push(part);
            }
          }
          return stack.join('/');
        };
        
        // Tries to find a module by resolving extensions
        const findModule = (path) => {
          const candidates = [
            path,
            path + '.ts',
            path + '.tsx',
            path + '/index.ts',
            path + '/index.tsx',
          ];
          for (const candidate of candidates) {
            if (modules[candidate]) return modules[candidate];
          }
          return null;
        };

        const createRequire = (basePath) => {
          const require = (path) => {
            if (externals[path]) {
              return externals[path];
            }
            
            const resolvedPath = path.startsWith('.') ? resolvePath(basePath, path) : path;
            const module = findModule(resolvedPath);

            if (!module) {
              throw new Error(\`Module not found: "\${path}" from "\${basePath}"\`);
            }
            
            if (!module.exports) {
              module.exports = {};
              // The factory gets a require function scoped to its own path
              module.factory(module.exports, createRequire(module.path));
            }
            return module.exports;
          };
          return require;
        };
        
        const define = (path, factory) => {
          modules[path] = { factory, path: path, exports: null };
        };
      `;
      
      const mockFetchScript = `
        const originalFetch = window.fetch;
        window.fetch = (url, options) => {
          const urlObject = new URL(url, window.location.origin);
          const path = urlObject.pathname;
          
          // Map /api/foo to src/api/foo
          const apiPath = path.startsWith('/api/') ? 'src' + path : null;
          let modulePath;

          if (apiPath) {
             const candidates = [apiPath, apiPath + '.ts', apiPath + '.tsx'];
             for (const candidate of candidates) {
               if (modules[candidate]) {
                 modulePath = candidate;
                 break;
               }
             }
          }
          
          if (modulePath) {
            console.log('Intercepted API call:', path);
            return new Promise((resolve, reject) => {
              try {
                const require = createRequire(modulePath);
                const handler = require(modulePath).default;
                
                if (typeof handler !== 'function') {
                  throw new Error(\`No default export function found for API route: \${modulePath}\`);
                }
                
                // Mock request object
                const req = {
                  method: options?.method || 'GET',
                  headers: options?.headers || {},
                  body: options?.body,
                  query: Object.fromEntries(urlObject.searchParams),
                };
  
                let statusCode = 200;
                let headers = {'Content-Type': 'application/json'};
  
                // Mock response object
                const res = {
                  status: (code) => {
                    statusCode = code;
                    return res; // allow chaining
                  },
                  json: (data) => {
                    const body = JSON.stringify(data);
                    resolve(new Response(body, { status: statusCode, headers }));
                  },
                  send: (data) => {
                    headers['Content-Type'] = 'text/plain';
                    resolve(new Response(String(data), { status: statusCode, headers }));
                  }
                };
                
                // Execute the handler
                handler(req, res);
                
              } catch (e) {
                console.error('API Route Execution Error:', e);
                const errorBody = JSON.stringify({ error: 'Server Error', message: e.message });
                resolve(new Response(errorBody, { status: 500, headers: {'Content-Type': 'application/json'} }));
              }
            });
          }
          
          // If not an API call, use the real fetch
          return originalFetch(url, options);
        };
      `;

      try {
        const compiledModules = debouncedFileContents
          .filter(file => file.path.endsWith('.ts') || file.path.endsWith('.tsx'))
          .map(file => {
            const transformed = Babel.transform(file.content, {
              presets: ['react', 'typescript'],
              plugins: [
                ['transform-modules-commonjs', { "strictMode": false }]
              ],
              filename: file.path,
            }).code;
            return `define('${file.path}', (exports, require) => { try { ${transformed} } catch(e) { console.error('Error in module ${file.path}:', e); throw e; } });`;
          })
          .join('\n');

        const renderScript = `
          try {
            const mainRequire = createRequire('${entryPoint}');
            const MainComponent = mainRequire('${entryPoint}').default;
            if(!MainComponent) { throw new Error('Could not find default export from ${entryPoint}'); }
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(MainComponent));
          } catch (e) {
            document.body.innerHTML = '<div style="color: red; padding: 2rem; font-family: sans-serif;"><h2>Runtime Error:</h2><pre>' + e.message + '</pre><pre>' + e.stack + '</pre></div>';
            console.error(e);
          }
        `;
        
        setCompiledCode(`${requireBoilerplate}\n${compiledModules}\n${mockFetchScript}\n${renderScript}`);
      } catch (e: any) {
        console.error("Compilation Error:", e);
        setError(`Compilation Error: ${e.message}`);
        setCompiledCode('');
      } finally {
        setIframeKey(key => key + 1);
      }
    };

    compile();
  }, [debouncedFileContents, entryPoint]);

  const srcDoc = `
    <html>
      <head>
        <style>
            body { margin: 0; background-color: transparent; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script>
          ${compiledCode}
        </script>
      </body>
    </html>
  `;

  return (
    <div className="flex-grow relative bg-gray-50 p-4">
        {error && (
            <div className="absolute inset-4 bg-red-50 text-red-800 p-4 overflow-auto z-10 rounded-lg border border-red-200">
                <h3 className="font-bold mb-2 text-red-900">Preview Error</h3>
                <pre className="text-sm font-mono whitespace-pre-wrap">{error}</pre>
            </div>
        )}
        <iframe
            key={iframeKey}
            title="Live Preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white rounded-2xl"
        />
    </div>
  );
};

export default LivePreview;
