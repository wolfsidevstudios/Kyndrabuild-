
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
  // FIX: Add pexels_api to support media integrations.
  | 'pexels_api';

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
  // FIX: Add pexels_api to support media integrations.
  pexels_api?: { apiKey: string };
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
    const config = integrations[key];
    if (!config) return false;
    return Object.values(config).some(v => typeof v === 'string' && v.trim() !== '');
  }, [integrations]);

  return { integrations, setIntegration, isConnected };
}