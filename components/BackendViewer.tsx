import React, { useMemo } from 'react';
import type { FileNode } from '../types';

interface BackendViewerProps {
  files: Map<string, FileNode>;
}

const parseApiFile = (content: string) => {
  const methods = new Set<string>();
  const methodRegex = /req\.method\s*===?\s*['"](GET|POST|PUT|DELETE|PATCH)['"]/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    methods.add(match[1]);
  }
  return Array.from(methods);
};

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'bg-blue-100 text-blue-800';
    case 'POST': return 'bg-green-100 text-green-800';
    case 'PUT': return 'bg-yellow-100 text-yellow-800';
    case 'DELETE': return 'bg-red-100 text-red-800';
    case 'PATCH': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const BackendViewer: React.FC<BackendViewerProps> = ({ files }) => {
  const apiFiles = useMemo(() => {
    return Array.from(files.values())
      // Fix: Explicitly type `file` as FileNode to resolve TypeScript errors.
      .filter((file: FileNode) => file.path.startsWith('src/api/') && file.type === 'file')
      .map((file: FileNode) => ({
        path: file.path.replace('src/api/', '/api/').replace(/\.tsx?$/, ''),
        methods: file.content ? parseApiFile(file.content) : [],
      }));
  }, [files]);

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Functions</h1>
        <p className="text-gray-600 mb-8">A visual representation of your serverless API routes.</p>
        
        {apiFiles.length > 0 ? (
          <div className="space-y-4">
            {apiFiles.map((apiFile, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                    <p className="font-mono text-lg font-semibold text-gray-800">{apiFile.path}</p>
                    <div className="flex items-center gap-2">
                        {apiFile.methods.length > 0 ? apiFile.methods.map(method => (
                            <span key={method} className={`px-2.5 py-0.5 text-sm font-semibold rounded-full ${getMethodColor(method)}`}>
                                {method}
                            </span>
                        )) : (
                            <span className="text-sm text-gray-500">No methods detected</span>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">data_object</span>
            <h3 className="text-xl font-semibold text-gray-800">No API Routes Found</h3>
            <p className="text-gray-500 mt-2">Create a new file in the <code className="bg-gray-100 p-1 rounded">src/api/</code> directory to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackendViewer;