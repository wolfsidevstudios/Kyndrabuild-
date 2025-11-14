
import React from 'react';

export type Tool = 'code' | 'apis' | 'data' | 'image' | 'model' | 'env' | 'payments' | 'deploy' | 'select' | 'logs' | 'settings';

interface ToolInfo {
  id: Tool;
  icon: string;
  label: string;
}

const tools: ToolInfo[] = [
  { id: 'code', icon: 'code', label: 'Code' },
  { id: 'apis', icon: 'hub', label: 'APIs' },
  { id: 'data', icon: 'database', label: 'Data' },
  { id: 'image', icon: 'image', label: 'Image' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
  { id: 'model', icon: 'psychology', label: 'Model' },
  { id: 'env', icon: 'key', label: 'Env' },
  { id: 'payments', icon: 'credit_card', label: 'Payments' },
  { id: 'deploy', icon: 'cloud_upload', label: 'Deploy' },
  { id: 'select', icon: 'ads_click', label: 'Select' },
  { id: 'logs', icon: 'history', label: 'Logs' },
];

interface ToolShelfProps {
  onToolSelect: (tool: Tool) => void;
  activeTool: Tool | null;
  layout?: 'horizontal' | 'vertical';
}

const ToolShelf: React.FC<ToolShelfProps> = ({ onToolSelect, activeTool, layout = 'horizontal' }) => {
  if (layout === 'vertical') {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-md rounded-full p-2 flex flex-col gap-2 border border-gray-200/80 shadow-lg">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => onToolSelect(tool.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            activeTool === tool.id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title={tool.label}
                    >
                        <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                    </button>
                ))}
            </div>
        </div>
    )
  }
  
  // Horizontal layout for mobile
  return (
    <div className="w-full overflow-x-auto py-2">
        <div className="flex items-center gap-4 px-4">
        {tools.map(tool => (
            <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`flex flex-col items-center gap-1 flex-shrink-0 w-14 transition-colors ${
                    activeTool === tool.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                }`}
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    activeTool === tool.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                    <span className="material-symbols-outlined text-xl">{tool.icon}</span>
                </div>
                <span className="text-xs font-medium">{tool.label}</span>
            </button>
        ))}
        </div>
    </div>
  );
};

export default ToolShelf;
