import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import SparkleIcon from './icons/SparkleIcon';

interface GenerationProgressCardProps {
  explanation: string;
  files: { path: string; status: 'pending' | 'done' }[];
}

const GenerationProgressCard: React.FC<GenerationProgressCardProps> = ({ explanation, files }) => {
  return (
    <div className="flex justify-start">
      <div className="p-4 rounded-2xl max-w-sm bg-gray-100 text-gray-800 w-full">
        <div className="flex items-center space-x-2 mb-3">
          <SparkleIcon className="text-blue-500 text-lg" />
          <span className="text-sm font-semibold text-gray-700">Applying Changes</span>
        </div>
        <div className="text-sm text-gray-700 mb-4 prose prose-sm max-w-none">
            <MarkdownRenderer content={explanation} />
        </div>
        <div>
          <ul className="space-y-1.5">
            {files.map((file) => (
              <li key={file.path} className="flex items-center text-sm text-gray-600 transition-colors duration-300">
                {file.status === 'done' ? (
                  <span className="material-symbols-outlined text-base text-green-500 mr-2">check_circle</span>
                ) : (
                  <svg className="animate-spin h-4 w-4 text-gray-400 mr-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span className={`font-mono text-xs ${file.status === 'done' ? 'text-gray-800' : 'text-gray-500'}`}>{file.path}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgressCard;
