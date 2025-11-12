
import React, { useState, useEffect } from 'react';
import PexelsIcon from '../icons/PexelsIcon';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';

interface MediaProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    activeConfigId: string | null;
}

// Reusable components (can be extracted to a shared file later)
const ConfigHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to providers
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">Enter your API key to connect the media provider.</p>
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


const PexelsConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });
    return (
        <div>
            <ConfigHeader title="Configure Pexels API" onBack={onBack} />
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <InputField label="Pexels API Key" name="apiKey" value={config.apiKey} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};


const MediaProviderCard = ({ title, description, icon, onConfigure, isConnected }: { title: string, description: string, icon: React.ReactNode, onConfigure: () => void, isConnected: boolean }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-start">
    <div className="flex justify-between items-start w-full">
        {icon}
        {isConnected && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Connected</span>}
    </div>
    <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
    <button
      onClick={onConfigure}
      className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors mt-auto"
    >
      {isConnected ? 'Manage' : 'Configure'}
    </button>
  </div>
);


const Media: React.FC<MediaProps> = ({ integrations, setIntegration, isConnected, onConfigured, activeConfigId }) => {
  const [configView, setConfigView] = useState<'overview' | 'pexels'>('overview');

  useEffect(() => {
    if (activeConfigId) setConfigView(activeConfigId as any);
  }, [activeConfigId]);

  const handleSave = (id: IntegrationId, name: string, config: any) => {
    // FIX: Pass the config object to setIntegration, not the integration name.
    setIntegration(id, config);
    onConfigured(id, name);
    setConfigView('overview');
  };

  const renderContent = () => {
    switch(configView) {
      case 'pexels':
        return <PexelsConfig 
                  onBack={() => setConfigView('overview')} 
                  initialConfig={integrations.pexels_api || { apiKey: '' }}
                  onSave={(config) => handleSave('pexels_api', 'Pexels', config)}
                />;
      case 'overview':
      default:
        return (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Media</h1>
            <p className="text-gray-600 mb-8">Connect to stock photo & video services to use in your application.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MediaProviderCard 
                title="Pexels"
                description="Free stock photos, royalty free images & videos shared by creators."
                icon={<PexelsIcon className="h-10 w-10" />}
                onConfigure={() => setConfigView('pexels')}
                isConnected={isConnected('pexels_api')}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Media;
