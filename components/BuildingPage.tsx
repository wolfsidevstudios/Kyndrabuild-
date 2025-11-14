
import React from 'react';
import type { AiTask, Project } from '../App';

interface BuildingPageProps {
  aiTask: AiTask | null;
  project: Project | null;
}

const BuildingPage: React.FC<BuildingPageProps> = ({ aiTask, project }) => {
    const files = aiTask?.files || [];
    const allDone = files.every(f => f.status === 'done');

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="flex items-center gap-4 mb-6">
                    {allDone ? (
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                        </div>
                    ) : (
                        <div className="w-12 h-12">
                            <svg className="animate-spin h-full w-full text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {allDone ? "Build Complete!" : "Building Your App..."}
                        </h1>
                        <p className="text-gray-600">
                           {allDone ? "Redirecting to the editor..." : `Generating files for ${project?.name || 'your new project'}`}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {files.map((file) => (
                        <div key={file.path} className="bg-gray-100 rounded-lg p-3 flex items-center justify-between transition-all duration-300">
                            <span className="font-mono text-sm text-gray-700">{file.path}</span>
                            {file.status === 'done' ? (
                                <span className="material-symbols-outlined text-green-500 animate-in fade-in zoom-in">check</span>
                            ) : (
                                <div className="w-4 h-4">
                                    <svg className="animate-spin h-full w-full text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuildingPage;
