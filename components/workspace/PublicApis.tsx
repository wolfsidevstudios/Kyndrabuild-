
import React from 'react';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';

interface PublicApisProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
}

const puterApis: { id: IntegrationId; name: string; description: string; icon: string }[] = [
  { id: 'puter_weather', name: 'Weather', description: 'Get real-time weather information for any location.', icon: 'thermostat' },
  { id: 'puter_currency', name: 'Currency Converter', description: 'Convert between different currencies with up-to-date rates.', icon: 'currency_exchange' },
  { id: 'puter_url_shortener', name: 'URL Shortener', description: 'Create short, shareable links from long URLs.', icon: 'link' },
  { id: 'puter_qr_code', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs.', icon: 'qr_code_2' },
  { id: 'puter_screenshot', name: 'Screenshot API', description: 'Capture screenshots of any website.', icon: 'screenshot' },
  { id: 'puter_ip_geolocation', name: 'IP Geolocation', description: 'Get location details from an IP address.', icon: 'public' },
  { id: 'puter_password_generator', name: 'Password Generator', description: 'Create strong, random passwords.', icon: 'password' },
  { id: 'puter_random_data', name: 'Random Data', description: 'Generate random users, posts, and more for testing.', icon: 'person_add' },
  { id: 'puter_hashing', name: 'Hashing', description: 'Hash data using MD5, SHA1, SHA256, and more.', icon: 'enhanced_encryption' },
  { id: 'puter_whois', name: 'WHOIS Lookup', description: 'Get registration information for domain names.', icon: 'domain' },
  { id: 'puter_dns_lookup', name: 'DNS Lookup', description: 'Perform DNS lookups for any domain.', icon: 'dns' },
  { id: 'puter_port_scanner', name: 'Port Scanner', description: 'Check for open ports on a server.', icon: 'lan' },
  { id: 'puter_fake_data', name: 'Fake Data Generator', description: 'Generate fake names, addresses, and other data.', icon: 'badge' },
  { id: 'puter_timezone', name: 'Timezone API', description: 'Get timezone information for a location.', icon: 'schedule' },
  { id: 'puter_news', name: 'News API', description: 'Fetch top headlines from various news sources.', icon: 'news' },
  { id: 'puter_geocoding', name: 'Geocoding', description: 'Convert addresses to geographic coordinates.', icon: 'pin_drop' },
  { id: 'puter_translation', name: 'Translation', description: 'Translate text between different languages.', icon: 'translate' },
  { id: 'puter_image_manipulation', name: 'Image Manipulation', description: 'Resize, crop, and apply filters to images.', icon: 'auto_fix_high' },
  { id: 'puter_file_conversion', name: 'File Conversion', description: 'Convert files between different formats.', icon: 'change_circle' },
  { id: 'puter_youtube_downloader', name: 'YouTube Downloader', description: 'Download videos from YouTube.', icon: 'download' },
];

// FIX: Define props with an interface and use React.FC to correctly type the component for use in a list with a `key` prop.
interface ProviderCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onToggle: () => void;
    isEnabled: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ title, description, icon, onToggle, isEnabled }) => (
    <div className="bg-gray-100 p-6 rounded-2xl flex flex-col items-start">
        <div className="flex justify-between items-start w-full">
            {icon}
            {isEnabled && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Enabled</span>}
        </div>
        <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{description}</p>
        <button
            onClick={onToggle}
            className="w-full bg-white text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white/80 transition-colors mt-auto"
        >
            {isEnabled ? 'Disable' : 'Enable'}
        </button>
    </div>
);

const PublicApis: React.FC<PublicApisProps> = ({ setIntegration, isConnected, onConfigured }) => {

    const handleToggle = (id: IntegrationId, name: string) => {
        const currentlyEnabled = isConnected(id);
        setIntegration(id, { enabled: !currentlyEnabled });
        if (!currentlyEnabled) {
            onConfigured(id, name);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Public APIs (Puter.js)</h1>
            <p className="text-gray-600 mb-6">Enable keyless public APIs. The AI can use these to build data-driven features.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {puterApis.map((api) => (
                    <ProviderCard
                        key={api.id}
                        title={api.name}
                        description={api.description}
                        icon={<span className="material-symbols-outlined text-3xl text-gray-500">{api.icon}</span>}
                        isEnabled={isConnected(api.id)}
                        onToggle={() => handleToggle(api.id, api.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PublicApis;
