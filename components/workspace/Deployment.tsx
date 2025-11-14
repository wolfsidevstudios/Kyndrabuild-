
import React, { useState, useEffect } from 'react';
import VercelIcon from '../icons/VercelIcon';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';
import type { DeployState, KyndraDeployState } from '../../../App';
import SparkleIcon from '../icons/SparkleIcon';

interface DeploymentProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    activeConfigId: string | null;
    appName: string;
    setAppName: (name: string) => void;
    deployState: DeployState;
    onDeploy: () => void;
    kyndraDeployState: KyndraDeployState;
    onKyndraDeploy: () => void;
}

// Reusable components
const ConfigHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <>
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to providers
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">Enter your credentials to connect the deployment provider.</p>
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
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800"
            placeholder={placeholder}
        />
    </div>
);

const VercelConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [token, setToken] = useState(initialConfig?.token || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToken(e.target.value);
        setError(null);
    };

    const handleSave = async () => {
        if (!token.trim()) {
            setError('Please enter a Personal Access Token.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('https://api.vercel.com/v2/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const { user } = await response.json();
                onSave({ token: token, user: { name: user.name, username: user.username, avatar: user.avatar } });
            } else {
                const errorData = await response.json();
                setError(errorData.error?.message || 'Failed to verify token. Please check it and try again.');
            }
        } catch (e) {
            setError('An error occurred while connecting to Vercel.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <ConfigHeader title="Configure Vercel" onBack={onBack} />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="Personal Access Token" name="token" value={token} onChange={handleChange} />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                <div className="pt-2">
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading} 
                        className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? 'Verifying...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeploymentProviderCard = ({ title, description, icon, onConfigure, isConnected }: { title: string, description: string, icon: React.ReactNode, onConfigure: () => void, isConnected: boolean }) => (
  <div className="bg-gray-100 p-6 rounded-2xl flex flex-col items-start">
    <div className="flex justify-between items-start w-full">
        {icon}
        {isConnected && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Connected</span>}
    </div>
    <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
    <button
      onClick={onConfigure}
      className="w-full bg-white text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white/80 transition-colors mt-auto"
    >
      {isConnected ? 'Manage' : 'Configure'}
    </button>
  </div>
);


const VercelDeploymentManager: React.FC<{
    appName: string;
    setAppName: (name: string) => void;
    deployState: DeployState;
    onDeploy: () => void;
    onReconfigure: () => void;
    user: { name: string; username: string; avatar: string; } | null;
}> = ({ appName, setAppName, deployState, onDeploy, onReconfigure, user }) => {
    const isAuthError = deployState.error && deployState.error.includes('Not authorized');

    return (
        <div className="bg-gray-100 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-900">Deploy to Vercel</h2>
                 {user && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-right">
                            <div>
                                <p className="font-semibold text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        </div>
                        <button
                            onClick={onReconfigure}
                            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
                            title="Change Vercel Account"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                )}
            </div>
            <p className="text-gray-600 mb-6">Publish your project to a live URL on Vercel's global network.</p>

            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center bg-white rounded-full border border-gray-200 h-10 transition-all focus-within:border-gray-800 focus-within:ring-2 focus-within:ring-gray-800/20 flex-grow">
                    <input
                        type="text"
                        placeholder="your-app-name"
                        className="bg-transparent pl-4 pr-1 text-sm w-full focus:outline-none text-gray-800"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                        disabled={deployState.isDeploying}
                    />
                    <span className="text-sm text-gray-400 border-l border-gray-300 pl-2 pr-4">.vercel.app</span>
                </div>
                <button 
                    onClick={onDeploy} 
                    disabled={deployState.isDeploying || !appName}
                    className="px-5 py-2 h-10 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                   {deployState.isDeploying ? 'Publishing...' : 'Publish'}
                </button>
            </div>

            {(deployState.isDeploying || deployState.url || deployState.error) && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Deployment Status</h3>
                    {deployState.isDeploying && (
                        <div className="flex items-center gap-3 text-gray-600 animate-pulse">
                             <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Deployment in progress. This may take a moment...</span>
                        </div>
                    )}
                    {deployState.url && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">🚀 Successfully deployed! Your app is live at:</p>
                            <a href={deployState.url} target="_blank" rel="noopener noreferrer" className="text-green-900 font-mono text-sm underline hover:text-green-700 break-all">{deployState.url}</a>
                        </div>
                    )}
                    {deployState.error && (
                         <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">Deployment failed:</p>
                            <p className="text-red-700 font-mono text-sm break-words">{deployState.error}</p>
                            {isAuthError && (
                                <div className="mt-4">
                                    <p className="text-sm text-red-800 mb-3">This seems to be an authorization issue. Please check if your Vercel Personal Access Token is correct and has the necessary permissions.</p>
                                    <button
                                        onClick={onReconfigure}
                                        className="bg-red-100 text-red-800 py-1.5 px-4 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                                    >
                                        Update Token
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const Deployment: React.FC<DeploymentProps> = ({ 
    integrations, 
    setIntegration, 
    isConnected, 
    onConfigured, 
    activeConfigId, 
    appName, 
    setAppName, 
    deployState, 
    onDeploy, 
    kyndraDeployState, 
    onKyndraDeploy
}) => {
  const [configView, setConfigView] = useState<'overview' | 'vercel'>('overview');

  useEffect(() => {
    if (activeConfigId === 'vercel_deployment') setConfigView('vercel');
  }, [activeConfigId]);

  const handleSave = (id: IntegrationId, name: string, config: any) => {
    setIntegration(id, config);
    onConfigured(id, name);
    setConfigView('overview');
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Deployment</h1>
            <p className="text-gray-600">Publish your application to the web.</p>
        </div>
        
        <div className="bg-gray-100 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
                <SparkleIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Kyndra Build Hosting</h2>
            </div>
            <p className="text-gray-600 mb-6">Instantly publish and share your project with our integrated, zero-config hosting.</p>
            <div className="flex items-center gap-3 mb-6">
                 <div className="flex items-center bg-white rounded-full border border-gray-200 h-10 transition-all focus-within:border-gray-800 focus-within:ring-2 focus-within:ring-gray-800/20 flex-grow">
                    <input
                        type="text"
                        placeholder="your-app-name"
                        className="bg-transparent pl-4 pr-1 text-sm w-full focus:outline-none text-gray-800"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value.replace(/[^a-z0-9-]/g, ''))}
                    />
                    <span className="text-sm text-gray-400 border-l border-gray-300 pl-2 pr-4">.kyndrabuild.app</span>
                </div>
                <button 
                    onClick={onKyndraDeploy}
                    disabled={!appName}
                    className="px-5 py-2 h-10 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                   Publish
                </button>
            </div>
            {kyndraDeployState.url && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">🚀 Project published! Your app is live at:</p>
                    <a href={kyndraDeployState.url} target="_blank" rel="noopener noreferrer" className="text-green-900 font-mono text-sm underline hover:text-green-700 break-all">{kyndraDeployState.url}</a>
                </div>
            )}
        </div>
        
        {isConnected('vercel_deployment') ? (
            <VercelDeploymentManager 
                appName={appName}
                setAppName={setAppName}
                deployState={deployState}
                onDeploy={onDeploy}
                onReconfigure={() => setConfigView('vercel')}
                user={integrations.vercel_deployment?.user || null}
            />
        ) : (
             <DeploymentProviderCard 
                  title="Vercel"
                  description="A platform for frontend frameworks and static sites, built to integrate with your headless content, commerce, or database."
                  icon={<VercelIcon className="h-10 w-10 text-black" />}
                  onConfigure={() => setConfigView('vercel')}
                  isConnected={false}
                />
        )}
        
        {configView === 'vercel' && !isConnected('vercel_deployment') && (
            <VercelConfig 
                onBack={() => setConfigView('overview')} 
                initialConfig={integrations.vercel_deployment}
                onSave={(config) => handleSave('vercel_deployment', 'Vercel', config)}
            />
        )}

      </div>
    </div>
  );
};

export default Deployment;
