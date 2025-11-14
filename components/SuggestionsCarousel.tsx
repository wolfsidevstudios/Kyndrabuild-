
import React from 'react';

interface PlanningPageProps {
  prompt: string;
  planningSteps: string[];
}

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const PlanningPage: React.FC<PlanningPageProps> = ({ prompt, planningSteps }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
                <TypingIndicator />
                <p className="text-gray-600 font-medium">AI is planning your app...</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm text-gray-700 space-y-2">
                <div>
                    <span className="text-green-600 mr-2">$</span>
                    <span className="text-gray-400">User prompt:</span> "{prompt}"
                </div>
                {planningSteps.map((log, index) => (
                    <div key={index}>
                        <span className="text-blue-500 mr-2">{'>'}</span>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default PlanningPage;
