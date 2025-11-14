
import React, { useState, useEffect } from 'react';
import PolarIcon from '../icons/PolarIcon';
import StripeIcon from '../icons/StripeIcon';
import SquareIcon from '../icons/SquareIcon';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';

interface PaymentsProps {
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
        <p className="text-gray-600 mb-8">Enter your API keys to connect the payment provider.</p>
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

// Configuration form for Polar
const PolarConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });
    return (
        <div>
            <ConfigHeader title="Configure Polar" onBack={onBack} />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="Personal Access Token" name="token" value={config.token} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// Configuration form for Stripe
const StripeConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });

    return (
        <div>
            <ConfigHeader title="Configure Stripe" onBack={onBack} />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="Publishable Key" name="publishableKey" value={config.publishableKey} onChange={handleChange} />
                <InputField label="Secret Key" name="secretKey" value={config.secretKey} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// Configuration form for Square
const SquareConfig = ({ onBack, onSave, initialConfig }: { onBack: () => void, onSave: (config: any) => void, initialConfig: any }) => {
    const [config, setConfig] = useState(initialConfig);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, [e.target.name]: e.target.value });

    return (
        <div>
            <ConfigHeader title="Configure Square" onBack={onBack} />
            <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <InputField label="Application ID" name="appId" value={config.appId} onChange={handleChange} />
                <InputField label="Access Token" name="accessToken" value={config.accessToken} onChange={handleChange} />
                <div className="pt-2">
                    <button onClick={() => onSave(config)} className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};


const PaymentProviderCard = ({ title, description, icon, onConfigure, isConnected }: { title: string, description: string, icon: React.ReactNode, onConfigure: () => void, isConnected: boolean }) => (
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


const Payments: React.FC<PaymentsProps> = ({ integrations, setIntegration, isConnected, onConfigured, activeConfigId }) => {
  const [configView, setConfigView] = useState<'overview' | 'polar' | 'stripe' | 'square'>('overview');

  useEffect(() => {
    if (activeConfigId) setConfigView(activeConfigId as any);
  }, [activeConfigId]);

  const handleSave = (id: IntegrationId, name: string, config: any) => {
    setIntegration(id, config);
    onConfigured(id, name);
    setConfigView('overview');
  };

  const renderContent = () => {
    switch(configView) {
      case 'polar':
        return <PolarConfig 
                  onBack={() => setConfigView('overview')} 
                  initialConfig={integrations.polar_payments || { token: '' }}
                  onSave={(config) => handleSave('polar_payments', 'Polar', config)}
                />;
      case 'stripe':
        return <StripeConfig 
                  onBack={() => setConfigView('overview')} 
                  initialConfig={integrations.stripe_payments || { publishableKey: '', secretKey: '' }}
                  onSave={(config) => handleSave('stripe_payments', 'Stripe', config)}
                />;
      case 'square':
        return <SquareConfig 
                  onBack={() => setConfigView('overview')} 
                  initialConfig={integrations.square_payments || { appId: '', accessToken: '' }}
                  onSave={(config) => handleSave('square_payments', 'Square', config)}
                />;
      case 'overview':
      default:
        return (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Payments</h1>
            <p className="text-gray-600 mb-6">Integrate payments to monetize your application.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PaymentProviderCard 
                title="Polar"
                description="The creator platform for developers. Fund your open source projects with subscriptions, donations, and issue funding."
                icon={<PolarIcon className="h-10 w-10 text-gray-800" />}
                onConfigure={() => setConfigView('polar')}
                isConnected={isConnected('polar_payments')}
              />
              <PaymentProviderCard 
                title="Stripe"
                description="A complete payments platform engineered for growth. Accept payments and manage your business online."
                icon={<StripeIcon className="h-10 w-10" />}
                onConfigure={() => setConfigView('stripe')}
                isConnected={isConnected('stripe_payments')}
              />
              <PaymentProviderCard 
                title="Square"
                description="Payment solutions for businesses of all sizes. Take payments in person, online, or on the go."
                icon={<SquareIcon className="h-10 w-10" />}
                onConfigure={() => setConfigView('square')}
                isConnected={isConnected('square_payments')}
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

export default Payments;
