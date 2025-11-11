
import React from 'react';
import type { FileNode } from '../types';

interface CodeViewerProps {
  file: FileNode | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  return (
    <div className="flex-grow flex flex-col bg-[#282c34] overflow-hidden">
        <div className="p-3 bg-white border-b border-gray-200">
            <h2 className="font-mono text-sm text-gray-500">{file ? file.path : 'No file selected'}</h2>
        </div>
        <div className="flex-grow overflow-auto p-4">
            {file && file.content ? (
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">
                    <code>{file.content.trim()}</code>
                </pre>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Select a file to view its code</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default CodeViewer;