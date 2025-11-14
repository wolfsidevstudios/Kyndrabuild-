
import React from 'react';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';
import type { DeployState } from '../../../App';
import PublicApis from './PublicApis';
import Database from './Database';
import Authentication from './Authentication';

interface ApisPanelProps {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
    deployState: DeployState;
}


const ApisPanel: React.FC<ApisPanelProps> = (props) => (
    <div className="p-4 space-y-8">
        <PublicApis {...props} />
        <Database {...props} activeConfigId={null} />
        <Authentication {...props} activeConfigId={null} />
    </div>
);

export default ApisPanel;
