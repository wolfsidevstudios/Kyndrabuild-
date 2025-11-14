
import React, { useState, useEffect } from 'react';
import FirebaseIcon from '../icons/FirebaseIcon';
import SupabaseIcon from '../icons/SupabaseIcon';
import KindraIcon from '../icons/KindraIcon';
import GoogleIcon from '../icons/GoogleIcon';
import GithubIcon from '../icons/GithubIcon';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';
import type { DeployState } from '../../../App';


interface AuthProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    activeConfigId: string | null;
    deployState: DeployState;
}

const ConfigHeader = ({ title, onBack, description }: { title: string, onBack: () => void, description: string }) => (
    <>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to providers
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
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

const FirebaseAuth = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });

    return (
        <div>
            <ConfigHeader title="Configure Firebase Authentication" onBack={onBack} description="Enter your project credentials to connect your authentication provider." />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="API Key" name="apiKey" value={config.apiKey} onChange={handleChange} />
                <InputField label="Auth Domain" name="authDomain" value={config.authDomain} placeholder="your-project.firebaseapp.com" onChange={handleChange} />
                <InputField label="Project ID" name="projectId" value={config.projectId} placeholder="your-gcp-project-id" onChange={handleChange} />
                <InputField label="Storage Bucket" name="storageBucket" value={config.storageBucket} placeholder="your-project.appspot.com" onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

const SupabaseAuth = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });
    
    return (
        <div>
            <ConfigHeader title="Configure Supabase Auth" onBack={onBack} description="Enter your project credentials to connect your authentication provider." />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="Supabase URL" name="url" value={config.url} placeholder="https://<your-project-ref>.supabase.co" onChange={handleChange} />
                <InputField label="Supabase Public (Anon) Key" name="anonKey" value={config.anonKey} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

const KindraConfig = ({ onBack, onSave, initialConfig, isConnected, deployUrl }: { onBack: () => void, onSave: (id: IntegrationId, name: string, config: any) => void, initialConfig: Integrations, isConnected: (id: IntegrationId) => boolean, deployUrl: string }) => {
    const [googleConfig, setGoogleConfig] = useState(initialConfig.kindra_google_auth || { clientId: '' });
    const [githubConfig, setGithubConfig] = useState(initialConfig.kindra_github_auth || { clientId: '', clientSecret: '' });

    const handleGoogleChange = (e: React.ChangeEvent<HTMLInputElement>) => setGoogleConfig({ ...googleConfig, [e.target.name]: e.target.value });
    const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => setGithubConfig({ ...githubConfig, [e.target.name]: e.target.value });

    const googleCallbackUrl = `https://${deployUrl}/api/auth/callback/google`;
    const githubCallbackUrl = `https://${deployUrl}/api/auth/callback/github`;
    
    const [googleCopied, setGoogleCopied] = useState(false);
    const [githubCopied, setGithubCopied] = useState(false);

    const handleCopy = (url: string, type: 'google' | 'github') => {
        navigator.clipboard.writeText(url);
        if(type === 'google') setGoogleCopied(true);
        if(type === 'github') setGithubCopied(true);
        setTimeout(() => {
            setGoogleCopied(false);
            setGithubCopied(false);
        }, 2000);
    };

    return (
        <div>
            <ConfigHeader title="Configure K-Indra Auth" onBack={onBack} description="Activate social logins for your deployed application." />
            <div className="space-y-6">
                {/* Google Config */}
                <div className="bg-gray-100 p-6 rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <GoogleIcon />
                            <h3 className="text-xl font-bold text-gray-800">Google Sign-In</h3>
                        </div>
                        {isConnected('kindra_google_auth') && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 mb-4">Add your Google Client ID to enable sign-in. You'll need to add the following URL to your authorized redirect URIs in the Google Cloud Console.</p>
                    <div className="bg-white p-2 rounded-lg text-sm font-mono text-gray-700 flex items-center justify-between mb-4">
                        <span className="truncate">{googleCallbackUrl}</span>
                        <button onClick={() => handleCopy(googleCallbackUrl, 'google')} className="p-1 rounded-md hover:bg-gray-200">
                           <span className="material-symbols-outlined text-base">{googleCopied ? 'done' : 'content_copy'}</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <InputField label="Google Client ID" name="clientId" value={googleConfig.clientId} onChange={handleGoogleChange} />
                        <div className="pt-2">
                            <button onClick={() => onSave('kindra_google_auth', 'K-Indra Google Auth', googleConfig)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                                Save & Activate
                            </button>
                        </div>
                    </div>
                </div>

                {/* GitHub Config */}
                <div className="bg-gray-100 p-6 rounded-2xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <GithubIcon />
                            <h3 className="text-xl font-bold text-gray-800">GitHub Sign-In</h3>
                        </div>
                         {isConnected('kindra_github_auth') && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 mb-4">Add your GitHub Client ID and Secret. You'll need to add the following URL as the 'Authorization callback URL' in your GitHub OAuth App settings.</p>
                     <div className="bg-white p-2 rounded-lg text-sm font-mono text-gray-700 flex items-center justify-between mb-4">
                        <span className="truncate">{githubCallbackUrl}</span>
                        <button onClick={() => handleCopy(githubCallbackUrl, 'github')} className="p-1 rounded-md hover:bg-gray-200">
                           <span className="material-symbols-outlined text-base">{githubCopied ? 'done' : 'content_copy'}</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        <InputField label="GitHub Client ID" name="clientId" value={githubConfig.clientId} onChange={handleGithubChange} />
                        <InputField label="GitHub Client Secret" name="clientSecret" value={githubConfig.clientSecret} onChange={handleGithubChange} />
                        <div className="pt-2">
                            <button onClick={() => onSave('kindra_github_auth', 'K-Indra GitHub Auth', githubConfig)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                                Save & Activate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const AuthProviderCard = ({ title, description, icon, onConfigure, isConnected, disabled = false, disabledText = "" }: { title: string, description: string, icon: React.ReactNode, onConfigure: () => void, isConnected: boolean, disabled?: boolean, disabledText?: string }) => (
  <div className={`bg-gray-100 p-6 rounded-2xl flex flex-col items-start ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex justify-between items-start w-full">
        {icon}
        {isConnected && !disabled && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Connected</span>}
    </div>
    <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
    {disabled ? (
        <div className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg text-sm font-semibold text-center mt-auto">
            {disabledText}
        </div>
    ) : (
        <button
            onClick={onConfigure}
            className="w-full bg-white text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white/80 transition-colors mt-auto"
        >
            {isConnected ? 'Manage' : 'Configure'}
        </button>
    )}
  </div>
);

const Authentication: React.FC<AuthProps> = ({ integrations, setIntegration, isConnected, onConfigured, activeConfigId, deployState }) => {
  const [configView, setConfigView] = useState<'overview' | 'firebase' | 'supabase' | 'kindra'>('overview');

  useEffect(() => {
      if (activeConfigId === 'auth') setConfigView('supabase'); // default to supabase if generic auth
      else if (activeConfigId) setConfigView(activeConfigId as any);
  }, [activeConfigId]);

  const handleSave = (id: IntegrationId, name: string, config: any) => {
      setIntegration(id, config);
      onConfigured(id, name);
      // Don't go back to overview for K-Indra, allow multiple activations
      if (id !== 'kindra_google_auth' && id !== 'kindra_github_auth') {
        setConfigView('overview');
      }
  };

  const renderContent = () => {
    switch(configView) {
      case 'firebase':
        return <FirebaseAuth 
                    onBack={() => setConfigView('overview')} 
                    initialConfig={integrations.firebase_auth || { apiKey: '', authDomain: '', projectId: '', storageBucket: '' }}
                    onSave={(config) => handleSave('firebase_auth', 'Firebase Auth', config)} 
                />;
      case 'supabase':
        return <SupabaseAuth 
                    onBack={() => setConfigView('overview')} 
                    initialConfig={integrations.supabase_auth || { url: '', anonKey: '' }}
                    onSave={(config) => handleSave('supabase_auth', 'Supabase Auth', config)} 
                />;
      case 'kindra':
        return <KindraConfig
                    onBack={() => setConfigView('overview')}
                    initialConfig={integrations}
                    onSave={handleSave}
                    isConnected={isConnected}
                    deployUrl={deployState.url || ''}
                />;
      case 'overview':
      default:
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Authentication</h1>
            <p className="text-gray-600 mb-6">Add user sign-up and login to your application.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthProviderCard 
                title="K-Indra Auth"
                description="Our own managed authentication service for your deployed app. Activate social logins like Google and GitHub with ease."
                icon={<KindraIcon className="h-10 w-10 text-gray-800" />}
                onConfigure={() => setConfigView('kindra')}
                isConnected={isConnected('kindra_google_auth') || isConnected('kindra_github_auth')}
                disabled={!deployState.url}
                disabledText="Deploy your app to enable"
              />
              <AuthProviderCard 
                title="Firebase Authentication"
                description="Leverage Google's comprehensive identity solution, supporting email, social logins, and more with robust security."
                icon={<FirebaseIcon className="h-10 w-10" />}
                onConfigure={() => setConfigView('firebase')}
                isConnected={isConnected('firebase_auth')}
              />
              <AuthProviderCard 
                title="Supabase Auth"
                description="An open-source Firebase alternative that provides a complete backend, including authentication, with a focus on PostgreSQL."
                icon={<SupabaseIcon className="h-10 w-10" />}
                onConfigure={() => setConfigView('supabase')}
                isConnected={isConnected('supabase_auth')}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div>
        {renderContent()}
    </div>
  );
};

export default Authentication;
