import React from 'react';
import type { RequiredIntegration } from '../../App';
import SupabaseIcon from './icons/SupabaseIcon';
import FirebaseIcon from './icons/FirebaseIcon';

interface IntegrationCardProps {
  integration: RequiredIntegration;
  onConfigure: () => void;
  onSkip: () => void;
}

const getIcon = (id: string) => {
    if (id.includes('supabase')) return <SupabaseIcon className="h-8 w-8" />;
    if (id.includes('firebase')) return <FirebaseIcon className="h-8 w-8" />;
    // Add other icons as needed
    return <span className="material-symbols-outlined text-2xl text-gray-500">extension</span>;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, onConfigure, onSkip }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-sm">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
                {getIcon(integration.id)}
            </div>
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-900 mb-1">Action Required: Configure {integration.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onConfigure}
                        className="w-full bg-gray-800 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Configure
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default IntegrationCard;
