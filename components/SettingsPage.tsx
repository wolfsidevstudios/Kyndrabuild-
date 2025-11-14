import React from 'react';
import type { AiModel } from '../../App';
import GeminiIcon from './icons/GeminiIcon';
import ChatgptIcon from './icons/ChatgptIcon';
import ClaudeIcon from './icons/ClaudeIcon';

interface SettingsPageProps {
  currentModel: AiModel;
  onUpdateModel: (model: AiModel) => void;
}

const ModelProviderCard = ({ title, description, icon, onSelect, isCurrent }: { title: string, description: string, icon: React.ReactNode, onSelect: () => void, isCurrent: boolean }) => (
    <div
      className={`bg-white border border-gray-200 p-6 rounded-2xl flex flex-col items-start transition-all cursor-pointer hover:shadow-lg hover:border-gray-300 ${isCurrent ? 'ring-2 ring-gray-800/50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start w-full">
          <div className="w-10 h-10">{icon}</div>
          {isCurrent && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Default</span>}
      </div>
      <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
    </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ currentModel, onUpdateModel }) => {
  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
            <header>
                <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Configure your global preferences for the app builder.</p>
            </header>
            
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Default AI Model</h2>
                <p className="text-gray-600 mb-6">Choose the default AI model for all new projects you create. All models are free to use without an API key.</p>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Google</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <ModelProviderCard 
                        title="Gemini 2.5 Pro"
                        description="Google's most capable model, great for complex reasoning, coding, and creative tasks."
                        icon={<GeminiIcon />}
                        onSelect={() => onUpdateModel('gemini')}
                        isCurrent={currentModel === 'gemini'}
                    />
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Puter.js Models (OpenAI)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     <ModelProviderCard 
                        title="GPT-5 Nano"
                        description="A fast and efficient model, optimized for speed and quick responses."
                        icon={<ChatgptIcon />}
                        onSelect={() => onUpdateModel('puter_gpt_5_nano')}
                        isCurrent={currentModel === 'puter_gpt_5_nano'}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Puter.js Models (Anthropic)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                     <ModelProviderCard 
                        title="Claude 4.5 Sonnet"
                        description="Anthropic's balanced model for intelligent conversation and content generation."
                        icon={<ClaudeIcon />}
                        onSelect={() => onUpdateModel('puter_claude_sonnet_4_5')}
                        isCurrent={currentModel === 'puter_claude_sonnet_4_5'}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsPage;