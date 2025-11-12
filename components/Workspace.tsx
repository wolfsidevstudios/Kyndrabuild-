
import React, { useState, useEffect } from 'react';
import type { FileNode } from '../types';
import type { Integrations, IntegrationId } from '../hooks/useIntegrations';
import type { HistoryEntry, DeployState } from '../../App';
import BackendViewer from './BackendViewer';
import Database from './workspace/Database';
import ProjectDetails from './workspace/ProjectDetails';
import Authentication from './workspace/Authentication';
import Payments from './workspace/Payments';
import HistoryViewer from './workspace/HistoryViewer';
import HistoryIcon from './icons/HistoryIcon';
import Deployment from './workspace/Deployment';


interface WorkspaceProps {
  files: Map<string, FileNode>;
  integrations: Integrations;
  setIntegration: (key: IntegrationId, value: any) => void;
  isConnected: (key: IntegrationId) => boolean;
  onIntegrationConfigured: (id: IntegrationId, name: string) => void;
  activeConfig: { view: string, configId: string } | null;
  history: HistoryEntry[];
  onRestore: (historyId: string) => void;
  appName: string;
  setAppName: (name: string) => void;
  deployState: DeployState;
  onDeploy: () => void;
}

type WorkspaceView = 'project' | 'backend' | 'database' | 'auth' | 'payments' | 'history' | 'deployment';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-100/70'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Workspace: React.FC<WorkspaceProps> = ({ 
  files, 
  integrations, 
  setIntegration, 
  isConnected, 
  onIntegrationConfigured,
  activeConfig,
  history,
  onRestore,
  appName,
  setAppName,
  deployState,
  onDeploy,
}) => {
  const [view, setView] = useState<WorkspaceView>('project');

  useEffect(() => {
    if (activeConfig) {
      setView(activeConfig.view as WorkspaceView);
    }
  }, [activeConfig]);

  const renderIcon = (iconName: string) => <span className="material-symbols-outlined text-lg">{iconName}</span>;

  return (
    <div className="flex h-full bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 p-4 flex flex-col gap-2">
        <NavItem icon={renderIcon("info")} label="Project Details" isActive={view === 'project'} onClick={() => setView('project')} />
        <NavItem icon={renderIcon("data_object")} label="Backend" isActive={view === 'backend'} onClick={() => setView('backend')} />
        <NavItem icon={renderIcon("database")} label="Database" isActive={view === 'database'} onClick={() => setView('database')} />
        <NavItem icon={renderIcon("security")} label="Authentication" isActive={view === 'auth'} onClick={() => setView('auth')} />
        <NavItem icon={renderIcon("credit_card")} label="Payments" isActive={view === 'payments'} onClick={() => setView('payments')} />
        <NavItem icon={renderIcon("cloud_upload")} label="Deployment" isActive={view === 'deployment'} onClick={() => setView('deployment')} />
        <NavItem icon={<HistoryIcon className="h-5 w-5" />} label="History" isActive={view === 'history'} onClick={() => setView('history')} />
      </aside>
      <main className="flex-1 overflow-y-auto">
        {view === 'project' && <ProjectDetails />}
        {view === 'backend' && <BackendViewer files={files} />}
        {view === 'database' && (
          <Database 
            integrations={integrations} 
            setIntegration={setIntegration}
            isConnected={isConnected}
            onConfigured={onIntegrationConfigured}
            activeConfigId={activeConfig?.view === 'database' ? activeConfig.configId : null}
          />
        )}
        {view === 'auth' && (
          <Authentication 
            integrations={integrations}
            setIntegration={setIntegration}
            isConnected={isConnected}
            onConfigured={onIntegrationConfigured}
            activeConfigId={activeConfig?.view === 'auth' ? activeConfig.configId : null}
            deployState={deployState}
          />
        )}
        {view === 'payments' && (
           <Payments 
            integrations={integrations}
            setIntegration={setIntegration}
            isConnected={isConnected}
            onConfigured={onIntegrationConfigured}
            activeConfigId={activeConfig?.view === 'payments' ? activeConfig.configId : null}
          />
        )}
        {view === 'deployment' && (
            <Deployment
                integrations={integrations}
                setIntegration={setIntegration}
                isConnected={isConnected}
                onConfigured={onIntegrationConfigured}
                activeConfigId={activeConfig?.view === 'deployment' ? activeConfig.configId : null}
                appName={appName}
                setAppName={setAppName}
                deployState={deployState}
                onDeploy={onDeploy}
            />
        )}
        {view === 'history' && (
           <HistoryViewer history={history} onRestore={onRestore} />
        )}
      </main>
    </div>
  );
};

export default Workspace;
