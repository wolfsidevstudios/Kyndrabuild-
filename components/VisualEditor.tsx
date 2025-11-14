
import React, { useState, useEffect, useCallback, useRef } from 'react';
import LivePreview, { ConsoleLogEntry } from './LivePreview';
import type { FileNode } from '../types';
import type { Project, HistoryEntry, UiInstructions, AiModel, ChatGptVersion, AiTask, ChatMessage, DeployState, KyndraDeployState } from '../../App';
import type { Integrations, IntegrationId } from '../../hooks/useIntegrations';
import ToolShelf, { Tool } from './PillToggle';
import SlideUpPanel from './ThemeGalleryPopup';
import Workspace from './Workspace';
import BuildingLoader from './WavyLoader';
import ChatHistoryPanel from './ChatHistoryPanel';

type View = 'build' | 'planning' | 'editor' | 'projects';

interface EditorPageProps {
  files: Map<string, FileNode>;
  entryPoint: string;
  onError: (error: string) => void;
  onSendMessage: (prompt: string, attachment?: File | { name: string, url: string }) => void;
  isLoading: boolean;
  project: Project | null;
  integrations: Integrations;
  aiTask: AiTask | null;
  chatHistory: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  uiInstructions: UiInstructions;
  onUpdateUiInstructions: (updates: Partial<UiInstructions>) => void;
  aiModel: AiModel;
  onUpdateAiModel: (model: AiModel) => void;
  chatgptVersion: ChatGptVersion;
  onUpdateChatGptVersion: (version: ChatGptVersion) => void;
  integrationsConfig: {
    integrations: Integrations;
    setIntegration: (key: IntegrationId, value: any) => void;
    isConnected: (key: IntegrationId) => boolean;
    onConfigured: (id: IntegrationId, name: string) => void;
  };
  onNavigate: (view: View) => void;
  appName: string;
  setAppName: (name: string) => void;
  deployState: DeployState;
  onDeploy: () => void;
  kyndraDeployState: KyndraDeployState;
  onKyndraDeploy: () => void;
  environmentVariables: Record<string, string>;
  onUpdateEnvironmentVariables: (vars: Record<string, string>) => void;
  consoleLogs: ConsoleLogEntry[];
  onUpdateConsoleLogs: (logs: any[]) => void;
  onUpdateProjectDetails: (projectId: string, updates: Partial<Pick<Project, 'name' | 'description' | 'pwa' | 'previewImage'>>) => void;
}

const EditorPage: React.FC<EditorPageProps> = (props) => {
    const { files, entryPoint, onError, onSendMessage, isLoading, project, integrations, aiTask, chatHistory, onNavigate, onUpdateConsoleLogs } = props;
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [isChatHistoryOpen, setChatHistoryOpen] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | { name: string, url: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dist = useRef(0);

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2) {
            dist.current = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.touches.length === 2) {
            const newDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
            if (newDist > dist.current + 30) { // Pinch out
                setIsFullScreen(true);
                dist.current = newDist;
            } else if (newDist < dist.current - 30) { // Pinch in
                setIsFullScreen(false);
                dist.current = newDist;
            }
        }
    };
    
    const handleToolSelect = (tool: Tool) => {
        if (tool === 'select') {
            alert('Visual select tool coming soon!');
        } else {
            setActiveTool(tool);
        }
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((chatInput.trim() || attachedFile) && !isLoading) {
            onSendMessage(chatInput, attachedFile as File | { name: string, url: string } | undefined);
            setChatInput('');
            setAttachedFile(null);
        }
    };
    
    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile(file);
        }
        if(fileInputRef.current) fileInputRef.current.value = ''; // Reset to allow same file selection
    };

    const handleAttachGeneratedImage = useCallback((name: string, url: string) => {
        setAttachedFile({ name, url });
        setActiveTool(null); // Close the panel after attaching
    }, []);

    const handleDesktopKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit(e as any);
        }
    }

    const handleAddToPrompt = useCallback((prompt: string) => {
        setChatInput(prompt);
        // Could also focus the input here if needed
    }, []);
    
  return (
    <div className="relative w-full h-full flex flex-col bg-gray-100 overflow-hidden">
        {/* --- MOBILE LAYOUT --- */}
        <div className="lg:hidden flex flex-col h-full">
            <button
                onClick={() => onNavigate('projects')}
                className="absolute top-4 left-4 z-40 p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white transition-colors"
                aria-label="Go to My Apps"
            >
                <span className="material-symbols-outlined">home</span>
            </button>
            <div 
                className={`flex-grow flex items-center justify-center transition-all duration-300 ${isFullScreen ? 'p-0' : 'p-4'}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                <div className={`relative transition-all duration-300 bg-white rounded-2xl shadow-lg overflow-hidden ${isFullScreen ? 'w-full h-full rounded-none shadow-none' : 'h-[90%] max-h-[700px] aspect-[9/16]'}`}>
                    {isLoading && aiTask && <BuildingLoader aiTask={aiTask} />}
                    <div className={`w-full h-full transition-all duration-300 ${isLoading ? 'blur-md scale-105' : 'blur-0'}`}>
                        <LivePreview
                            files={files}
                            entryPoint={entryPoint}
                            onError={onError}
                            isLoading={false}
                            onAddToChat={() => {}}
                            project={project}
                            integrations={integrations}
                            onConsoleLog={(log) => onUpdateConsoleLogs([...props.consoleLogs, log])}
                        />
                    </div>
                </div>
            </div>
            
            {!isFullScreen && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md rounded-t-2xl border-t border-gray-200/80 z-30">
                    <div className="w-full flex justify-center pt-1">
                        <button onClick={() => setChatHistoryOpen(true)} className="p-1">
                            <span className="material-symbols-outlined text-gray-400">keyboard_arrow_up</span>
                        </button>
                    </div>
                    {attachedFile && (
                        <div className="px-3 pt-1">
                            <div className="p-1.5 bg-gray-100 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <img src={attachedFile instanceof File ? URL.createObjectURL(attachedFile) : attachedFile.url} alt="Preview" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                    <span className="text-xs font-medium text-gray-800 truncate">{attachedFile.name}</span>
                                </div>
                                <button onClick={() => setAttachedFile(null)} className="p-1 rounded-full hover:bg-gray-200 flex-shrink-0">
                                    <span className="material-symbols-outlined text-base text-gray-500">close</span>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="p-3 border-b border-gray-200">
                        <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                             <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/*" />
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-200">
                                <span className="material-symbols-outlined">attach_file</span>
                             </button>
                            <input 
                                type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                                placeholder="Describe a change..."
                                className="flex-grow bg-gray-100 border-none rounded-full h-10 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || (!chatInput.trim() && !attachedFile)} className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-300">
                                <span className="material-symbols-outlined">arrow_upward</span>
                            </button>
                        </form>
                    </div>
                    <ToolShelf onToolSelect={handleToolSelect} activeTool={activeTool} />
                </div>
            )}
        </div>
        
        {/* --- DESKTOP LAYOUT --- */}
        <div className="hidden lg:flex h-full w-full p-6 gap-6">
             <button
                onClick={() => onNavigate('projects')}
                className="absolute top-4 left-4 z-40 p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-800 hover:bg-white transition-colors"
                aria-label="Go to My Apps"
            >
                <span className="material-symbols-outlined">home</span>
            </button>
            <ToolShelf onToolSelect={handleToolSelect} activeTool={activeTool} layout="vertical" />
            <div className="relative flex-1 h-full flex items-center justify-center">
                 <div className="relative w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden max-w-[calc(100vh*9/16-100px)] aspect-[9/16]">
                    {isLoading && aiTask && <BuildingLoader aiTask={aiTask} />}
                    <div className={`w-full h-full transition-all duration-300 ${isLoading ? 'blur-md scale-105' : 'blur-0'}`}>
                        <LivePreview
                            files={files}
                            entryPoint={entryPoint}
                            onError={onError}
                            isLoading={false}
                            onAddToChat={() => {}}
                            project={project}
                            integrations={integrations}
                            onConsoleLog={(log) => onUpdateConsoleLogs([...props.consoleLogs, log])}
                        />
                    </div>
                </div>

                <form onSubmit={handleChatSubmit} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl p-4">
                     {attachedFile && (
                        <div className="mb-2 max-w-sm mx-auto">
                            <div className="p-1.5 bg-white/80 backdrop-blur-md border border-gray-300/50 rounded-lg flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <img src={attachedFile instanceof File ? URL.createObjectURL(attachedFile) : attachedFile.url} alt="Preview" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-800 truncate">{attachedFile.name}</span>
                                </div>
                                <button onClick={() => setAttachedFile(null)} className="p-1 rounded-full hover:bg-gray-200 flex-shrink-0">
                                    <span className="material-symbols-outlined text-base text-gray-600">close</span>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="relative">
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={handleDesktopKeyDown}
                            placeholder="Describe a change to your app..."
                            className="w-full bg-white/80 backdrop-blur-md border border-gray-300/50 rounded-2xl shadow-xl p-4 pl-14 pr-14 resize-none text-base focus:ring-2 focus:ring-gray-800 focus:outline-none transition-all"
                            rows={3}
                            disabled={isLoading}
                        />
                         <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/*" />
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute left-4 bottom-4 w-10 h-10 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                            <span className="material-symbols-outlined">attach_file</span>
                         </button>
                        <button type="submit" disabled={isLoading || (!chatInput.trim() && !attachedFile)} className="absolute right-4 bottom-4 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:bg-gray-300 hover:bg-gray-700 transition-colors">
                            <span className="material-symbols-outlined">arrow_upward</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

      <SlideUpPanel 
        isOpen={activeTool !== null} 
        onClose={() => setActiveTool(null)} 
        title={activeTool || ''}
        size={activeTool === 'code' ? 'full' : 'default'}
      >
        <Workspace 
            activeTool={activeTool}
            files={files}
            chatHistory={chatHistory}
            onAttachGeneratedImage={handleAttachGeneratedImage}
            {...props}
            {...props.integrationsConfig}
            onAddToPrompt={handleAddToPrompt}
        />
      </SlideUpPanel>
      
      <ChatHistoryPanel
        isOpen={isChatHistoryOpen}
        onClose={() => setChatHistoryOpen(false)}
        chatHistory={chatHistory}
      />
    </div>
  );
};

export default EditorPage;
