
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import type { FileNode } from '../types';
import SuggestionsCarousel from './SuggestionsCarousel';

declare const Babel: any;
declare const supabase: any;
declare const html2canvas: any;

interface LivePreviewProps {
  files: Map<string, FileNode>;
  entryPoint: string;
  onError: (error: string) => void;
  isLoading: boolean;
  onAddToChat: (prompt: string) => void;
  visualEditingEnabled?: boolean;
  onScreenshot?: (dataUrl: string) => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ files, entryPoint, onError, isLoading, onAddToChat, visualEditingEnabled = false, onScreenshot }) => {
  const [error, setError] = useState<string | null>(null);
  const [compiledCode, setCompiledCode] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);


  // Set up a persistent DB on the parent window to survive iframe reloads
  useEffect(() => {
    (window as any).dbForPreview = {}; // Initialize on mount
    return () => {
      delete (window as any).dbForPreview; // Cleanup on unmount
    };
  }, []);


  const fileContents = useMemo(() => {
    return Array.from(files.values())
      .filter((f: FileNode) => f.type === 'file' && f.content)
      .map((f: FileNode) => ({ path: f.path, content: f.content! }));
  }, [files]);
  
  const debouncedFileContents = useDebounce(fileContents, 500);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'preview_error') {
        const { message, stack } = event.data.payload;
        const fullError = `Runtime Error: ${message}\n${stack || 'No stack trace available.'}`;
        setError(fullError);
        onError(fullError);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onError]);

  useEffect(() => {
    const compile = async () => {
      if (typeof Babel === 'undefined') {
        const babelError = "Babel is not loaded.";
        setError(babelError);
        onError(babelError);
        return;
      }

      setError(null);

      const requireBoilerplate = `
        const modules = {};
        const externals = {
          'react': window.React,
          'react-dom': window.ReactDOM,
          '@supabase/supabase-js': window.supabase
        };
        const resolvePath = (base, relative) => {
          const stack = base.split('/');
          stack.pop();
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
        const findModule = (path) => {
          const candidates = [path, path + '.ts', path + '.tsx', path + '/index.ts', path + '/index.tsx'];
          for (const candidate of candidates) { if (modules[candidate]) return modules[candidate]; }
          return null;
        };
        const createRequire = (basePath) => {
          const require = (path) => {
            if (externals[path]) return externals[path];
            const resolvedPath = path.startsWith('.') ? resolvePath(basePath, path) : path;
            const module = findModule(resolvedPath);
            if (!module) throw new Error(\`Module not found: "\${path}" from "\${basePath}"\`);
            if (!module.exports) {
              module.exports = {};
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
        window.fetch = (input, options) => {
          const url = typeof input === 'string' ? input : input.url;
          // Only intercept internal API calls, preventing errors with external absolute URLs.
          if (url.startsWith('/api/')) {
            const urlObject = new URL(url, window.location.origin);
            const path = urlObject.pathname;
            const apiPath = 'src' + path;
            let modulePath;
            if (apiPath) {
               const candidates = [apiPath, apiPath + '.ts', apiPath + '.tsx'];
               for (const candidate of candidates) {
                 if (modules[candidate]) { modulePath = candidate; break; }
               }
            }
            if (modulePath) {
              return new Promise((resolve) => {
                try {
                  const require = createRequire(modulePath);
                  const handler = require(modulePath).default;
                  if (typeof handler !== 'function') throw new Error(\`No default export function found for API route: \${modulePath}\`);
                  const req = { method: options?.method || 'GET', headers: options?.headers || {}, body: options?.body, query: Object.fromEntries(urlObject.searchParams), };
                  let statusCode = 200;
                  let headers = {'Content-Type': 'application/json'};
                  const res = {
                    status: (code) => { statusCode = code; return res; },
                    json: (data) => { resolve(new Response(JSON.stringify(data), { status: statusCode, headers })); },
                    send: (data) => { headers['Content-Type'] = 'text/plain'; resolve(new Response(String(data), { status: statusCode, headers })); }
                  };
                  handler(req, res);
                } catch (e) {
                  console.error('API Route Execution Error:', e);
                  resolve(new Response(JSON.stringify({ error: 'Server Error', message: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} }));
                }
              });
            }
          }
          return originalFetch(input, options);
        };
      `;

      try {
        const compiledModules = debouncedFileContents
          .filter(file => file.path.endsWith('.ts') || file.path.endsWith('.tsx'))
          .map(file => {
            const transformed = Babel.transform(file.content, {
              presets: ['react', 'typescript'],
              plugins: [['transform-modules-commonjs', { "strictMode": false }]],
              filename: file.path,
            }).code;
            return `define('${file.path}', (exports, require) => { try { ${transformed} } catch(e) { console.error('Error in module ${file.path}:', e); throw e; } });`;
          })
          .join('\n');

        const renderScript = `
          const MainComponent = createRequire('${entryPoint}')('${entryPoint}').default;
          if(!MainComponent) { throw new Error('Could not find default export from ${entryPoint}'); }
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(MainComponent));
        `;
        
        setCompiledCode(`${requireBoilerplate}\n${compiledModules}\n${mockFetchScript}\n${renderScript}`);
      } catch (e: any) {
        console.error("Compilation Error:", e);
        const compileError = `Compilation Error: ${e.message}`;
        setError(compileError);
        onError(compileError);
        setCompiledCode('');
      } finally {
        setIframeKey(key => key + 1);
      }
    };

    compile();
  }, [debouncedFileContents, entryPoint, onError]);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onScreenshot) return;

    const takeScreenshot = () => {
        if (iframe.contentWindow && iframe.contentWindow.document.body.scrollHeight > 0 && !error) {
            html2canvas(iframe.contentWindow.document.body, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            }).then(canvas => {
                onScreenshot(canvas.toDataURL('image/jpeg', 0.8));
            }).catch(err => {
                console.error("html2canvas error:", err);
            });
        }
    };

    const handleLoad = () => {
        // Wait for styles and images to apply before taking screenshot
        const timer = setTimeout(takeScreenshot, 1000);
        return () => clearTimeout(timer);
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [iframeKey, onScreenshot, error]);

  const visualEditorScript = `
    <script>
      function getCssSelector(el) {
        if (!(el instanceof Element)) return;
        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
          let selector = el.nodeName.toLowerCase();
          if (el.id) {
            selector += '#' + el.id;
            path.unshift(selector);
            break;
          } else {
            let sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
              if (sib.nodeName.toLowerCase() == selector) nth++;
            }
            if (nth != 1) selector += ":nth-of-type("+nth+")";
          }
          path.unshift(selector);
          el = el.parentNode;
        }
        return path.join(" > ");
      }

      document.addEventListener('DOMContentLoaded', () => {
        if (!window.frameElement) return; // Don't run in new tab
        const style = document.createElement('style');
        style.textContent = \`
            [data-v-edit-hover] { outline: 2px solid #3b82f6 !important; outline-offset: 2px; cursor: pointer; border-radius: 4px; }
            [data-v-edit-selected] { outline: 2px solid #16a34a !important; outline-offset: 2px; border-radius: 4px; box-shadow: 0 0 12px #16a34a; }
        \`;
        document.head.appendChild(style);

        let lastHovered = null;
        document.body.addEventListener('mouseover', (e) => {
            if (lastHovered) lastHovered.removeAttribute('data-v-edit-hover');
            e.target.setAttribute('data-v-edit-hover', 'true');
            lastHovered = e.target;
        });

        document.body.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selector = getCssSelector(e.target);
            const tagName = e.target.tagName;

            document.querySelectorAll('[data-v-edit-selected]').forEach(el => el.removeAttribute('data-v-edit-selected'));
            e.target.setAttribute('data-v-edit-selected', 'true');

            window.parent.postMessage({
                type: 'visual_edit_select',
                payload: { selector, tagName }
            }, '*');
        }, true);
      });
    </script>
  `;

  const srcDoc = `
    <html>
      <head>
        <style> body { margin: 0; background-color: transparent; } </style>
        <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
        ${visualEditingEnabled ? visualEditorScript : ''}
      </head>
      <body>
        <div id="root"></div>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script>
          // Use persistent in-memory DB from parent to survive hot reloads
          if (window.parent && typeof window.parent.dbForPreview !== 'undefined') {
            window.db = window.parent.dbForPreview;
          } else {
            window.db = {}; // Fallback
          }

          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({
              type: 'preview_error',
              payload: {
                message: error ? error.toString() : message,
                stack: error ? error.stack : 'No stack trace available'
              }
            }, '*');
            return true; // Prevents default browser error handling
          };
          try {
            ${compiledCode}
          } catch(e) {
             window.onerror(e.message, null, null, null, e);
          }
        </script>
      </body>
    </html>
  `;

  const handleOpenInNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(srcDoc.replace(visualEditorScript, '')); // Don't include editor script in new tab
      newWindow.document.close();
    }
  };

  return (
    <div className="flex-grow relative bg-gray-50 p-4">
        <button
          onClick={handleOpenInNewTab}
          className="absolute top-6 right-6 z-20 p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors"
          title="Open in new tab"
          aria-label="Open in new tab"
        >
          <span className="material-symbols-outlined text-base">open_in_new</span>
        </button>
        {isLoading && <SuggestionsCarousel onAddToChat={onAddToChat} />}
        {error && (
            <div className="absolute inset-4 bg-red-50 text-red-800 p-4 overflow-auto z-10 rounded-lg border border-red-200">
                <h3 className="font-bold mb-2 text-red-900">Preview Error</h3>
                <pre className="text-sm font-mono whitespace-pre-wrap">{error}</pre>
            </div>
        )}
        <iframe
            ref={iframeRef}
            key={iframeKey}
            title="Live Preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin" // allow-same-origin is needed for postMessage
            className="w-full h-full border-0 bg-white rounded-2xl"
        />
    </div>
  );
};

export default LivePreview;