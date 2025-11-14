
import React, { useState } from 'react';
import type { AiModel, ChatGptVersion } from '../../../App';
import GeminiIcon from '../icons/GeminiIcon';
import ChatgptIcon from '../icons/ChatgptIcon';
import ClaudeIcon from '../icons/ClaudeIcon';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';
import DeepseekIcon from '../icons/DeepseekIcon';
import MistralIcon from '../icons/MistralIcon';
import QwenIcon from '../icons/QwenIcon';
import OpenRouterIcon from '../icons/OpenRouterIcon';

interface ModelProps {
  currentModel: AiModel;
  onUpdateModel: (model: AiModel) => void;
  integrations: Integrations;
  setIntegration: (key: IntegrationId, value: any) => void;
  isConnected: (key: IntegrationId) => boolean;
  onConfigured: (id: IntegrationId, name: string) => void;
  chatgptVersion: ChatGptVersion;
  onUpdateChatGptVersion: (version: ChatGptVersion) => void;
}

const ConfigHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to models
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">Enter your API key to enable this model.</p>
    </>
);

const InputField = ({ label, name, value, onChange, placeholder = '' }: { label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            type="text" 
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
            placeholder={placeholder}
        />
    </div>
);

const ApiKeyConfig = ({ title, onBack, onSave, initialKey }: { title: string, onBack: () => void, onSave: (config: any) => void, initialKey: string }) => {
    const [apiKey, setApiKey] = useState(initialKey);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value);

    return (
        <div>
            <ConfigHeader title={`Configure ${title}`} onBack={onBack} />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="API Key" name="apiKey" value={apiKey} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave({ apiKey })} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

const ModelProviderCard = ({ title, description, icon, onSelect, isCurrent, disabled = false, extraContent }: { title: string, description: string, icon: React.ReactNode, onSelect: () => void, isCurrent: boolean, disabled?: boolean, extraContent?: React.ReactNode }) => (
    <div
      className={`bg-gray-100 p-6 rounded-2xl flex flex-col items-start transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : `cursor-pointer hover:bg-gray-200/60 ${isCurrent ? 'ring-2 ring-gray-800/50' : ''}`
      }`}
      onClick={!disabled ? onSelect : undefined}
    >
      <div className="flex justify-between items-start w-full">
          <div className="w-10 h-10">{icon}</div>
          {isCurrent && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Current</span>}
      </div>
      <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      {extraContent}
      {disabled && <div className="text-xs text-center w-full text-gray-500 mt-auto pt-2 border-t border-gray-200">Requires OpenRouter Key</div>}
    </div>
);

const OpenRouterConfigCard = ({ onConfigure, isConnected }: { onConfigure: () => void, isConnected: boolean }) => (
  <div className={`bg-gray-100 p-6 rounded-2xl flex flex-col items-start ${!isConnected ? 'ring-2 ring-blue-500/30' : ''}`}>
    <div className="flex justify-between items-start w-full">
        <OpenRouterIcon className="h-10 w-10 text-gray-800" />
        {isConnected && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Connected</span>}
    </div>
    <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">OpenRouter API</h3>
    <p className="text-gray-600 text-sm mb-4 flex-grow">Connect your OpenRouter account to access a variety of free and paid models.</p>
    <button
      onClick={onConfigure}
      className="w-full bg-white text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white/80 transition-colors mt-auto"
    >
      {isConnected ? 'Manage API Key' : 'Add API Key'}
    </button>
  </div>
);

const Model: React.FC<ModelProps> = ({ currentModel, onUpdateModel, integrations, setIntegration, isConnected, onConfigured, chatgptVersion, onUpdateChatGptVersion }) => {
  const [configView, setConfigView] = useState<'overview' | 'chatgpt' | 'claude' | 'openrouter'>('overview');

  const handleSelect = (model: AiModel) => {
    if (model === 'gemini') {
        onUpdateModel('gemini');
        return;
    }
    
    if (model === 'chatgpt' && !isConnected('chatgpt_api')) {
        setConfigView('chatgpt');
    } else if (model === 'claude' && !isConnected('claude_api')) {
        setConfigView('claude');
    } else if (['deepseek', 'mistral', 'qwen'].includes(model) && !isConnected('openrouter_api')) {
        // This case is handled by disabled cards, but as a fallback:
        setConfigView('openrouter');
    } else {
        onUpdateModel(model);
    }
  };

  const handleSave = (model: AiModel | null, integrationId: IntegrationId, name: string, config: any) => {
    setIntegration(integrationId, config);
    onConfigured(integrationId, name);
    if (model) {
      onUpdateModel(model);
    }
    setConfigView('overview');
  };

  const renderContent = () => {
    switch (configView) {
        case 'chatgpt':
            return <ApiKeyConfig 
                        title="ChatGPT"
                        onBack={() => setConfigView('overview')}
                        initialKey={integrations.chatgpt_api?.apiKey || ''}
                        onSave={(config) => handleSave('chatgpt', 'chatgpt_api', 'ChatGPT', config)}
                    />;
        case 'claude':
            return <ApiKeyConfig 
                        title="Claude"
                        onBack={() => setConfigView('overview')}
                        initialKey={integrations.claude_api?.apiKey || ''}
                        onSave={(config) => handleSave('claude', 'claude_api', 'Claude', config)}
                    />;
        case 'openrouter':
            return <ApiKeyConfig 
                        title="OpenRouter"
                        onBack={() => setConfigView('overview')}
                        initialKey={integrations.openrouter_api?.apiKey || ''}
                        onSave={(config) => handleSave(null, 'openrouter_api', 'OpenRouter', config)}
                    />;
        case 'overview':
        default:
            return (
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Model</h1>
                    <p className="text-gray-600 mb-6">Choose the AI model that powers your assistant.</p>
                    
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Main Models</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModelProviderCard 
                            title="Gemini 2.5 Pro"
                            description="Google's most capable model, great for complex reasoning, coding, and creative tasks."
                            icon={<GeminiIcon />}
                            onSelect={() => handleSelect('gemini')}
                            isCurrent={currentModel === 'gemini'}
                        />
                         <ModelProviderCard 
                            title="ChatGPT"
                            description="Switch between GPT-4o for vision and performance or GPT-3.5 for speed. Requires API key."
                            icon={<ChatgptIcon />}
                            onSelect={() => handleSelect('chatgpt')}
                            isCurrent={currentModel === 'chatgpt'}
                            extraContent={currentModel === 'chatgpt' && (
                                <div className="mt-auto w-full pt-4 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-600 mb-2">Version:</p>
                                    <div className="flex items-center p-1 space-x-1 bg-gray-200 rounded-full">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateChatGptVersion('gpt-4o'); }}
                                            className={`flex-1 text-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${chatgptVersion === 'gpt-4o' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:bg-white/60'}`}
                                        >
                                            GPT-4o
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateChatGptVersion('gpt-3.5-turbo'); }}
                                            className={`flex-1 text-center px-3 py-1 text-xs font-medium rounded-full transition-colors ${chatgptVersion === 'gpt-3.5-turbo' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:bg-white/60'}`}
                                        >
                                            3.5 Turbo
                                        </button>
                                    </div>
                                </div>
                            )}
                        />
                         <ModelProviderCard 
                            title="Claude 4.5"
                            description="Anthropic's latest model, known for its large context window and strong performance. Requires API key."
                            icon={<ClaudeIcon />}
                            onSelect={() => handleSelect('claude')}
                            isCurrent={currentModel === 'claude'}
                        />
                    </div>

                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Free OpenRouter Models</h2>
                        <p className="text-gray-600 mb-6 max-w-3xl">These models are free to use via OpenRouter. You'll need to sign up for a free OpenRouter account and provide your API key to enable them.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <OpenRouterConfigCard
                                onConfigure={() => setConfigView('openrouter')}
                                isConnected={isConnected('openrouter_api')}
                            />
                            <ModelProviderCard 
                                title="DeepSeek V3.1 (free)"
                                description="A powerful, free-to-use coding model from DeepSeek AI."
                                icon={<DeepseekIcon />}
                                onSelect={() => handleSelect('deepseek')}
                                isCurrent={currentModel === 'deepseek'}
                                disabled={!isConnected('openrouter_api')}
                            />
                            <ModelProviderCard 
                                title="Mistral 7B Instruct (free)"
                                description="A fast and powerful model from Mistral AI, great for a wide range of tasks."
                                icon={<MistralIcon className="text-orange-500" />}
                                onSelect={() => handleSelect('mistral')}
                                isCurrent={currentModel === 'mistral'}
                                disabled={!isConnected('openrouter_api')}
                            />
                             <ModelProviderCard 
                                title="Qwen3 Coder (free)"
                                description="A state-of-the-art coding model from Alibaba Cloud. Using 7B variant for availability."
                                icon={<QwenIcon />}
                                onSelect={() => handleSelect('qwen')}
                                isCurrent={currentModel === 'qwen'}
                                disabled={!isConnected('openrouter_api')}
                            />
                        </div>
                    </div>
                </div>
            );
    }
  };

  return (
    <div>
        {renderContent()}
    </div>
  );
};

export default Model;
