
import React from 'react';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';

interface DataPanelProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    activeConfigId: string | null;
    onAddToPrompt: (prompt: string) => void;
}

const DataProviderCard = ({ 
    title, 
    description, 
    icon, 
    onToggle, 
    isEnabled,
    promptText,
    onAddToPrompt
}: { 
    title: string;
    description: string;
    icon: React.ReactNode;
    onToggle: () => void;
    isEnabled: boolean;
    promptText?: string;
    onAddToPrompt?: (prompt: string) => void;
}) => (
    <div className="bg-gray-100 p-6 rounded-2xl flex flex-col items-start">
      <div className="flex justify-between items-start w-full">
        {icon}
        {isEnabled && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Enabled</span>}
      </div>
      <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      <div className="w-full mt-auto space-y-2">
        {promptText && onAddToPrompt && (
            <button
                onClick={() => onAddToPrompt(promptText)}
                className="w-full bg-green-900/90 text-lime-300 py-2 rounded-lg text-sm font-semibold hover:bg-green-900 transition-colors shadow-[0_0_10px_rgba(163,230,53,0.3)]"
            >
                Add to Prompt
            </button>
        )}
        <button
          onClick={onToggle}
          className="w-full bg-white text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white/80 transition-colors"
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
);


const DataPanel: React.FC<DataPanelProps> = ({ integrations, setIntegration, isConnected, onConfigured, onAddToPrompt }) => {
    
    const handleToggle = (id: IntegrationId, name: string) => {
        const currentlyEnabled = isConnected(id);
        setIntegration(id, { enabled: !currentlyEnabled });
        if (!currentlyEnabled) {
            onConfigured(id, name);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Public Data Sources</h1>
            <p className="text-gray-600 mb-6">Enable public APIs that don't require an API key. The AI can use these to build data-driven features.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataProviderCard
                    title="JSONPlaceholder"
                    description="A free, fake online REST API for testing and prototyping. Provides mock data like users, posts, and comments."
                    icon={<span className="material-symbols-outlined text-3xl text-gray-500">data_object</span>}
                    isEnabled={isConnected('public_jsonplaceholder')}
                    onToggle={() => handleToggle('public_jsonplaceholder', 'JSONPlaceholder')}
                />
                <DataProviderCard
                    title="Cat Facts API"
                    description="A simple, fun API to fetch random cat facts. Great for adding dynamic content to your app."
                    icon={<span className="material-symbols-outlined text-3xl text-gray-500">pets</span>}
                    isEnabled={isConnected('public_cat_facts')}
                    onToggle={() => handleToggle('public_cat_facts', 'Cat Facts API')}
                />
                <DataProviderCard
                    title="Crypto Market Data"
                    description="A public API from CoinGecko to fetch real-time cryptocurrency prices. No API key needed."
                    icon={<span className="material-symbols-outlined text-3xl text-gray-500">currency_bitcoin</span>}
                    isEnabled={isConnected('public_crypto_market')}
                    onToggle={() => handleToggle('public_crypto_market', 'Crypto Market Data')}
                    promptText="Create a mobile app that shows the current price of Bitcoin, Ethereum, and Dogecoin."
                    onAddToPrompt={onAddToPrompt}
                />
            </div>
        </div>
    );
};

export default DataPanel;