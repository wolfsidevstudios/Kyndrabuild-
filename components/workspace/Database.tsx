import React, { useState, useEffect } from 'react';
import FirebaseIcon from '../icons/FirebaseIcon';
import SupabaseIcon from '../icons/SupabaseIcon';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';

interface DatabaseProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    activeConfigId: string | null;
}

// Reusable component for the configuration panel header
const ConfigHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to providers
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">Enter your project credentials to connect your database.</p>
    </>
);

// Reusable input field component
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


// Configuration form for Firestore
const FirestoreConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });

    return (
        <div>
            <ConfigHeader title="Connect to Google Firestore" onBack={onBack} />
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <InputField label="API Key" name="apiKey" value={config.apiKey} onChange={handleChange} />
                <InputField label="Auth Domain" name="authDomain" value={config.authDomain} placeholder="your-project.firebaseapp.com" onChange={handleChange} />
                <InputField label="Project ID" name="projectId" value={config.projectId} placeholder="your-gcp-project-id" onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Connection
                    </button>
                </div>
            </div>
        </div>
    );
};

// Configuration form for Supabase
const SupabaseConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });

    return (
        <div>
            <ConfigHeader title="Connect to Supabase" onBack={onBack} />
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <InputField label="Supabase URL" name="url" value={config.url} placeholder="https://<your-project-ref>.supabase.co" onChange={handleChange} />
                <InputField label="Supabase Public (Anon) Key" name="anonKey" value={config.anonKey} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Connection
                    </button>
                </div>
            </div>
        </div>
    );
};


const DBProviderCard = ({ title, description, icon, onConnect, isConnected }: { title: string, description: string, icon: React.ReactNode, onConnect: () => void, isConnected: boolean }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-start">
      <div className="flex justify-between items-start w-full">
        {icon}
        {isConnected && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Connected</span>}
      </div>
      <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
      <button
        onClick={onConnect}
        className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors mt-auto"
      >
        {isConnected ? 'Manage' : 'Connect'}
      </button>
    </div>
);

const Database: React.FC<DatabaseProps> = ({ integrations, setIntegration, isConnected, onConfigured, activeConfigId }) => {
    const [configView, setConfigView] = useState<'overview' | 'firestore' | 'supabase'>('overview');

    useEffect(() => {
        if (activeConfigId === 'db') setConfigView('supabase'); // Default to supabase if generic 'db'
        else if (activeConfigId) setConfigView(activeConfigId as any);
    }, [activeConfigId]);

    const handleSave = (id: IntegrationId, name: string, config: any) => {
        setIntegration(id, config);
        onConfigured(id, name);
        setConfigView('overview');
    };

    const renderContent = () => {
        switch(configView) {
            case 'firestore':
                return <FirestoreConfig 
                            onBack={() => setConfigView('overview')} 
                            initialConfig={integrations.firebase_db || { apiKey: '', authDomain: '', projectId: '' }}
                            onSave={(config) => handleSave('firebase_db', 'Firestore', config)}
                        />;
            case 'supabase':
                return <SupabaseConfig 
                            onBack={() => setConfigView('overview')} 
                            initialConfig={integrations.supabase_db || { url: '', anonKey: '' }}
                            onSave={(config) => handleSave('supabase_db', 'Supabase DB', config)}
                        />;
            case 'overview':
            default:
                return (
                    <>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database</h1>
                        <p className="text-gray-600 mb-8">Connect your application to a persistent database.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DBProviderCard 
                                title="Google Firestore"
                                description="A flexible, scalable NoSQL cloud database to store and sync data for client- and server-side development."
                                icon={<FirebaseIcon className="h-10 w-10" />}
                                onConnect={() => setConfigView('firestore')}
                                isConnected={isConnected('firebase_db')}
                            />
                            <DBProviderCard 
                                title="Supabase"
                                description="The open source Firebase alternative. Instantly create a backend with a Postgres database, authentication, and more."
                                icon={<SupabaseIcon className="h-10 w-10" />}
                                onConnect={() => setConfigView('supabase')}
                                isConnected={isConnected('supabase_db')}
                            />
                        </div>
                    </>
                );
        }
    };

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Database;
