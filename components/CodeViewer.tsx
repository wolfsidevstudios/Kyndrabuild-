import React, { useState, useEffect } from 'react';
import type { FileNode } from '../types';

interface Version {
  content: string;
  timestamp: number;
}

interface CodeViewerProps {
  file: FileNode | null;
  history: Version[];
  onRevert: (content: string) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ file, history, onRevert }) => {
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  useEffect(() => {
    // Reset to the latest version when the file changes or history updates
    setSelectedVersionIndex(0);
  }, [file, history.length]);

  const handleRevert = () => {
    if (selectedVersionIndex > 0) { // Can't revert to current version
      onRevert(history[selectedVersionIndex].content);
    }
  };

  const currentContent = history[selectedVersionIndex]?.content ?? file?.content ?? '';

  return (
    <div className="flex-grow flex flex-col bg-[#282c34] overflow-hidden">
        <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-mono text-sm text-gray-500 truncate">{file ? file.path : 'No file selected'}</h2>
            {file && history.length > 1 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedVersionIndex}
                  onChange={(e) => setSelectedVersionIndex(Number(e.target.value))}
                  className="bg-gray-100 border border-gray-200 rounded-md py-1 px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-800"
                  aria-label="Select file version"
                >
                  {history.map((version, index) => (
                    <option key={`${version.timestamp}-${index}`} value={index}>
                      Version {history.length - index} ({new Date(version.timestamp).toLocaleTimeString()}) {index === 0 ? '- Current' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleRevert}
                  disabled={selectedVersionIndex === 0}
                  className="px-2 py-1 text-xs font-semibold bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Revert to this version
                </button>
              </div>
            )}
        </div>
        <div className="flex-grow overflow-auto p-4">
            {file ? (
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">
                    <code>{currentContent.trim()}</code>
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
