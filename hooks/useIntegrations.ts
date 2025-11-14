
import { useState, useEffect, useCallback } from 'react';

// Define the shape of all possible integration credentials
export type IntegrationId = 
  | 'firebase_auth' 
  | 'supabase_auth' 
  | 'firebase_db' 
  | 'supabase_db' 
  | 'polar_payments' 
  | 'stripe_payments' 
  | 'square_payments'
  | 'vercel_deployment'
  | 'kindra_google_auth'
  | 'kindra_github_auth'
  | 'pexels_api'
  | 'sqlite_db'
  | 'chatgpt_api'
  | 'claude_api'
  | 'openrouter_api'
  | 'public_jsonplaceholder'
  | 'public_cat_facts'
  | 'public_crypto_market'
  | 'puter_weather'
  | 'puter_currency'
  | 'puter_url_shortener'
  | 'puter_qr_code'
  | 'puter_screenshot'
  | 'puter_ip_geolocation'
  | 'puter_password_generator'
  | 'puter_random_data'
  | 'puter_hashing'
  | 'puter_whois'
  | 'puter_dns_lookup'
  | 'puter_port_scanner'
  | 'puter_fake_data'
  | 'puter_timezone'
  | 'puter_news'
  | 'puter_geocoding'
  | 'puter_translation'
  | 'puter_image_manipulation'
  | 'puter_file_conversion'
  | 'puter_youtube_downloader';

export const validIntegrationIds: IntegrationId[] = [
  'firebase_auth',
  'supabase_auth',
  'firebase_db',
  'supabase_db',
  'polar_payments',
  'stripe_payments',
  'square_payments',
  'vercel_deployment',
  'kindra_google_auth',
  'kindra_github_auth',
  'pexels_api',
  'sqlite_db',
  'chatgpt_api',
  'claude_api',
  'openrouter_api',
  'public_jsonplaceholder',
  'public_cat_facts',
  'public_crypto_market',
  'puter_weather',
  'puter_currency',
  'puter_url_shortener',
  'puter_qr_code',
  'puter_screenshot',
  'puter_ip_geolocation',
  'puter_password_generator',
  'puter_random_data',
  'puter_hashing',
  'puter_whois',
  'puter_dns_lookup',
  'puter_port_scanner',
  'puter_fake_data',
  'puter_timezone',
  'puter_news',
  'puter_geocoding',
  'puter_translation',
  'puter_image_manipulation',
  'puter_file_conversion',
  'puter_youtube_downloader',
];

export interface Integrations {
  firebase_auth?: { apiKey: string; authDomain: string; projectId: string; storageBucket: string };
  supabase_auth?: { url: string; anonKey: string };
  firebase_db?: { apiKey: string; authDomain: string; projectId: string };
  supabase_db?: { url: string; anonKey: string };
  polar_payments?: { token: string };
  stripe_payments?: { publishableKey: string; secretKey: string };
  square_payments?: { appId: string; accessToken: string };
  vercel_deployment?: { 
    token: string;
    user?: {
        name: string;
        username: string;
        avatar: string;
    } 
  };
  kindra_google_auth?: { clientId: string };
  kindra_github_auth?: { clientId: string; clientSecret: string };
  pexels_api?: { apiKey: string };
  sqlite_db?: { enabled: boolean };
  chatgpt_api?: { apiKey: string };
  claude_api?: { apiKey: string };
  openrouter_api?: { apiKey: string };
  public_jsonplaceholder?: { enabled: boolean };
  public_cat_facts?: { enabled: boolean };
  public_crypto_market?: { enabled: boolean };
  puter_weather?: { enabled: boolean };
  puter_currency?: { enabled: boolean };
  puter_url_shortener?: { enabled: boolean };
  puter_qr_code?: { enabled: boolean };
  puter_screenshot?: { enabled: boolean };
  puter_ip_geolocation?: { enabled: boolean };
  puter_password_generator?: { enabled: boolean };
  puter_random_data?: { enabled: boolean };
  puter_hashing?: { enabled: boolean };
  puter_whois?: { enabled: boolean };
  puter_dns_lookup?: { enabled: boolean };
  puter_port_scanner?: { enabled: boolean };
  puter_fake_data?: { enabled: boolean };
  puter_timezone?: { enabled: boolean };
  puter_news?: { enabled: boolean };
  puter_geocoding?: { enabled: boolean };
  puter_translation?: { enabled: boolean };
  puter_image_manipulation?: { enabled: boolean };
  puter_file_conversion?: { enabled: boolean };
  puter_youtube_downloader?: { enabled: boolean };
}

const STORAGE_KEY = 'app-integrations';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integrations>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : {};
    } catch (error) {
      console.error('Error reading integrations from localStorage', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
    } catch (error) {
      console.error('Error saving integrations to localStorage', error);
    }
  }, [integrations]);

  const setIntegration = useCallback((key: IntegrationId, value: any) => {
    setIntegrations(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const isConnected = useCallback((key: IntegrationId) => {
    const config = integrations[key] as any;
    if (!config) return false;

    switch (key) {
        case 'sqlite_db':
        case 'public_jsonplaceholder':
        case 'public_cat_facts':
        case 'public_crypto_market':
        case 'puter_weather':
        case 'puter_currency':
        case 'puter_url_shortener':
        case 'puter_qr_code':
        case 'puter_screenshot':
        case 'puter_ip_geolocation':
        case 'puter_password_generator':
        case 'puter_random_data':
        case 'puter_hashing':
        case 'puter_whois':
        case 'puter_dns_lookup':
        case 'puter_port_scanner':
        case 'puter_fake_data':
        case 'puter_timezone':
        case 'puter_news':
        case 'puter_geocoding':
        case 'puter_translation':
        case 'puter_image_manipulation':
        case 'puter_file_conversion':
        case 'puter_youtube_downloader':
            return config.enabled === true;
        
        case 'firebase_auth':
            return !!(config.apiKey && config.authDomain && config.projectId && config.storageBucket);
        
        case 'supabase_auth':
        case 'supabase_db':
            return !!(config.url && config.anonKey);

        case 'firebase_db':
            return !!(config.apiKey && config.authDomain && config.projectId);
            
        case 'polar_payments':
            return !!config.token;
            
        case 'stripe_payments':
            return !!(config.publishableKey && config.secretKey);

        case 'square_payments':
            return !!(config.appId && config.accessToken);
        
        case 'vercel_deployment':
            return !!config.token;
        
        case 'kindra_google_auth':
            return !!config.clientId;

        case 'kindra_github_auth':
            return !!(config.clientId && config.clientSecret);
            
        case 'pexels_api':
        case 'chatgpt_api':
        case 'claude_api':
        case 'openrouter_api':
            return !!config.apiKey;
            
        default:
            return false;
    }
  }, [integrations]);

  return { integrations, setIntegration, isConnected };
}
