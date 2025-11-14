
import React from 'react';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';
import type { AttachmentContext } from '../../../App';

interface DataPanelProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    activeConfigId: string | null;
    onAddToPrompt: (prompt: string) => void;
    onAttachContext: (context: AttachmentContext) => void;
}

const DataProviderCard = ({ 
    title, 
    description, 
    icon, 
    promptText,
    onAttachContext
}: { 
    title: string;
    description: string;
    icon: React.ReactNode;
    promptText?: string;
    onAttachContext: () => void;
}) => (
    <div className="bg-gray-100 p-6 rounded-2xl flex flex-col items-start">
      <div className="flex justify-between items-start w-full">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      <div className="w-full mt-auto space-y-2">
        <button
          onClick={onAttachContext}
          className="w-full bg-white text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white/80 transition-colors"
        >
          Add as Context
        </button>
      </div>
    </div>
);


const DataPanel: React.FC<DataPanelProps> = ({ integrations, setIntegration, isConnected, onConfigured, onAddToPrompt, onAttachContext }) => {
    
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Public Data Sources</h1>
            <p className="text-gray-600 mb-6">Add public APIs to your chat context. The AI can use these to build data-driven features.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataProviderCard
                    title="JSONPlaceholder"
                    description="A free, fake online REST API for testing and prototyping. Provides mock data like users, posts, and comments."
                    icon={<span className="material-symbols-outlined text-3xl text-gray-500">data_object</span>}
                    onAttachContext={() => onAttachContext({ id: 'public_jsonplaceholder', name: 'JSONPlaceholder', type: 'api'})}
                />
                <DataProviderCard
                    title="Cat Facts API"
                    description="A simple, fun API to fetch random cat facts. Great for adding dynamic content to your app."
                    icon={<span className="material-symbols-outlined text-3xl text-gray-500">pets</span>}
                    onAttachContext={() => onAttachContext({ id: 'public_cat_facts', name: 'Cat Facts API', type: 'api'})}
                />
                <DataProviderCard
                    title="Crypto Market Data"
                    description="A public API from CoinGecko to fetch real-time cryptocurrency prices. No API key needed."
                    icon={<span className="material-symbols-outlined text-3xl text-gray-500">currency_bitcoin</span>}
                    onAttachContext={() => onAttachContext({ id: 'public_crypto_market', name: 'Crypto Market Data', type: 'api'})}
                />
            </div>
        </div>
    );
};

export default DataPanel;
