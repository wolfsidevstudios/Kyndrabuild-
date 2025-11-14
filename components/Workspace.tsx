
import React from 'react';
// FIX: Imported ChatMessage and HistoryEntry from App.tsx where they are defined, instead of types.ts.
import type { FileNode } from '../types';
import type { ChatMessage, HistoryEntry, DeployState, KyndraDeployState, Project } from '../../App';
import type { Integrations, IntegrationId } from '../hooks/useIntegrations';
import type { UiInstructions, AiModel, ChatGptVersion } from '../../App';
import type { ConsoleLogEntry } from './LivePreview';
import FileTree from './FileTree';
import CodeViewer from './CodeViewer';
import EnvironmentVariables from './workspace/EnvironmentVariables';
import Deployment from './workspace/Deployment';
import ConsoleLogsPanel from './workspace/ConsoleLogsPanel';
import DataPanel from './workspace/Data';
import ImageGeneratorPanel from './workspace/ImageGeneratorPanel';
import AppSettingsPanel from './workspace/AppSettingsPanel';
import type { Tool } from './PillToggle';
import Model from './workspace/Model';
import Payments from './workspace/Payments';
import ApisPanel from './workspace/ApisPanel';

interface WorkspaceProps {
  activeTool: Tool | null;
  files: Map<string, FileNode>;
  chatHistory: ChatMessage[];
  history: HistoryEntry[];
  integrations: Integrations;
  setIntegration: (key: IntegrationId, value: any) => void;
  isConnected: (key: IntegrationId) => boolean;
  onConfigured: (id: IntegrationId, name: string) => void;
  uiInstructions: UiInstructions;
  onUpdateUiInstructions: (updates: Partial<UiInstructions>) => void;
  aiModel: AiModel;
  onUpdateAiModel: (model: AiModel) => void;
  chatgptVersion: ChatGptVersion;
  onUpdateChatGptVersion: (version: ChatGptVersion) => void;
  appName: string;
  setAppName: (name: string) => void;
  deployState: DeployState;
  onDeploy: () => void;
  kyndraDeployState: KyndraDeployState;
  onKyndraDeploy: () => void;
  environmentVariables: Record<string, string>;
  onUpdateEnvironmentVariables: (vars: Record<string, string>) => void;
  consoleLogs: ConsoleLogEntry[];
  onAddToPrompt: (prompt: string) => void;
  project: Project | null;
  onUpdateProjectDetails: (projectId: string, updates: Partial<Pick<Project, 'name' | 'description' | 'pwa' | 'previewImage'>>) => void;
  onAttachGeneratedImage: (name: string, url: string) => void;
}

const CodePanel = ({ files }: { files: Map<string, FileNode> }) => {
    const [selectedFilePath, setSelectedFilePath] = React.useState<string | null>('src/App.tsx');
    const projectFiles = React.useMemo(() => {
        // This is a simplified reconstruction. For a real app, this should come from a single source of truth.
        const root: FileNode = { name: 'src', type: 'directory', path: 'src', children: [] };
        const pathMap = new Map<string, FileNode>();
        pathMap.set('src', root);

        Array.from(files.values()).forEach(file => {
            const parts = file.path.split('/');
            let currentPath = '';
            let parentNode: FileNode | undefined = undefined;

            for(let i=0; i < parts.length -1; i++) {
                currentPath += (i > 0 ? '/' : '') + parts[i];
                parentNode = pathMap.get(currentPath);
            }
            if (parentNode && parentNode.type === 'directory' && parentNode.children) {
                 if (!parentNode.children.find(c => c.path === file.path)) {
                    parentNode.children.push(file);
                 }
            } else if (file.path.startsWith('src/')) {
                 root.children?.push(file);
            }
        });
        
        const sortChildren = (node: FileNode) => {
            if (node.children) {
                node.children.sort((a, b) => {
                    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                });
                node.children.forEach(sortChildren);
            }
        };
        sortChildren(root);
        return root;

    }, [files]);
    
    const selectedFile = selectedFilePath ? files.get(selectedFilePath) : null;

    return (
        <div className="h-full flex flex-col">
            <div className="h-1/3 border-b border-gray-200 overflow-y-auto">
                 <FileTree node={projectFiles} selectedFilePath={selectedFilePath} onSelectFile={setSelectedFilePath} />
            </div>
            <div className="h-2/3">
                 <CodeViewer file={selectedFile ?? null} history={[]} onRevert={() => {}}/>
            </div>
        </div>
    )
}

const Workspace: React.FC<WorkspaceProps> = (props) => {
    const { activeTool, files, chatHistory, environmentVariables, onUpdateEnvironmentVariables, consoleLogs } = props;

    switch(activeTool) {
        case 'code':
            return <CodePanel files={files} />;
        case 'apis':
            return <ApisPanel {...props} />;
        case 'data':
            return <DataPanel {...props} activeConfigId={null} />;
        case 'image':
            return <ImageGeneratorPanel onAttach={props.onAttachGeneratedImage} />;
        case 'settings':
            return <AppSettingsPanel 
                        project={props.project}
                        onUpdateDetails={props.onUpdateProjectDetails}
                    />;
        case 'model':
            return <Model 
                currentModel={props.aiModel}
                onUpdateModel={props.onUpdateAiModel}
                chatgptVersion={props.chatgptVersion}
                onUpdateChatGptVersion={props.onUpdateChatGptVersion}
                {...props}
            />;
        case 'env':
            return <EnvironmentVariables
                variables={environmentVariables}
                onUpdate={onUpdateEnvironmentVariables}
            />;
        case 'payments':
            return <div className="p-4"><Payments {...props} activeConfigId={null}/></div>;
        case 'deploy':
            return <Deployment {...props} activeConfigId={null} />;
        case 'logs':
            return <ConsoleLogsPanel logs={consoleLogs} />;
        default:
            return <div className="p-4 text-gray-500">Select a tool to begin.</div>;
    }
};

export default Workspace;
