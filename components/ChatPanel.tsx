
import React, { useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import SparkleIcon from './icons/SparkleIcon';
import IntegrationCard from './IntegrationCard';
import SqlScriptCard from './SqlScriptCard';
import type { RequiredIntegration, SqlScript, AiTask, CustomIntegrationRequest, AiModel } from '../../App';
import type { IntegrationId, Integrations } from '../../hooks/useIntegrations';
import GenerationProgressCard from './GenerationProgressCard';
import CustomIntegrationCard from './CustomIntegrationCard';

type ChatMessage = {
  author: 'user' | 'ai';
  content: string;
  historyId?: string;
  attachment?: {
    name: string;
    url: string; // data URL for preview
  };
};

interface ChatPanelProps {
  messages: ChatMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  aiTask: AiTask | null;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  requiredIntegrations: RequiredIntegration[];
  onConfigureRequest: (integrationId: IntegrationId) => void;
  onSkipIntegration: (integration: RequiredIntegration) => void;
  customIntegrationRequest: CustomIntegrationRequest | null;
  onActivateCustomIntegration: (request: CustomIntegrationRequest, credentials: Record<string, string>) => void;
  sqlScript: SqlScript | null;
  onDismissSqlScript: () => void;
  onRestore: (historyId: string) => void;
  attachedFile: File | null;
  onFileChange: (file: File | null) => void;
  integrations: Integrations;
  aiModel: AiModel;
  onBoostUi: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
    messages, 
    inputValue, 
    onInputChange, 
    onSendMessage, 
    aiTask, 
    suggestions, 
    onSuggestionClick,
    requiredIntegrations,
    onConfigureRequest,
    onSkipIntegration,
    customIntegrationRequest,
    onActivateCustomIntegration,
    sqlScript,
    onDismissSqlScript,
    onRestore,
    attachedFile,
    onFileChange,
    integrations,
    aiModel,
    onBoostUi
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoading = aiTask !== null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTask, requiredIntegrations, sqlScript, customIntegrationRequest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || attachedFile) && !isLoading) {
      onSendMessage(inputValue);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        onFileChange(file);
    }
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const modelName = {
    gemini: "Gemini",
    chatgpt: "ChatGPT",
    claude: "Claude"
  }[aiModel] || "AI";

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 relative">
      <header className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">{modelName} Assistant</h2>
      </header>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-40">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`p-3 rounded-2xl max-w-sm ${
              msg.author === 'user' 
                ? 'bg-white text-gray-800 border border-gray-200 shadow-sm hover:bg-gray-50 transition-all' 
                : 'bg-gray-100 text-gray-800'
            }`}>
               {msg.author === 'ai' 
                ? (
                    <div>
                        <MarkdownRenderer content={msg.content} />
                        {msg.historyId && (
                            <button 
                                onClick={() => onRestore(msg.historyId!)}
                                className="mt-3 w-full bg-white/60 hover:bg-white text-gray-700 border border-gray-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">history</span>
                                Restore this version
                            </button>
                        )}
                    </div>
                )
                : (
                    <>
                        {msg.attachment && (
                            <div className="mb-2 p-2 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-md hover:border-gray-300">
                                <img src={msg.attachment.url} alt={msg.attachment.name} className="rounded-md max-w-full h-auto" />
                            </div>
                        )}
                        {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                    </>
                )
              }
            </div>
          </div>
        ))}

        {aiTask?.status === 'generating' && (
          <GenerationProgressCard 
            explanation={aiTask.explanation}
            files={aiTask.files}
          />
        )}

        {requiredIntegrations.length > 0 && (
          <div className="space-y-3">
            {requiredIntegrations.map(req => (
              <IntegrationCard 
                key={req.id} 
                integration={req} 
                onConfigure={() => onConfigureRequest(req.id)}
                onSkip={() => onSkipIntegration(req)}
              />
            ))}
          </div>
        )}
        {customIntegrationRequest && (
            <CustomIntegrationCard 
                request={customIntegrationRequest}
                onActivate={(credentials) => onActivateCustomIntegration(customIntegrationRequest, credentials)}
            />
        )}
        {sqlScript && (
            <SqlScriptCard 
                script={sqlScript} 
                onDismiss={onDismissSqlScript}
                integrations={integrations}
            />
        )}
        {aiTask?.status === 'thinking' && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2 p-3">
                <SparkleIcon className="text-blue-500 text-lg animate-pulse" />
                <span className="text-sm text-gray-600">Thinking</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
        {suggestions.length > 0 && !isLoading && !attachedFile && (
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <span className="material-symbols-outlined text-base text-gray-500 mr-2">lightbulb</span>
              <p className="text-sm font-medium text-gray-600">Suggestions</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {attachedFile && (
            <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2 overflow-hidden">
                    <img src={URL.createObjectURL(attachedFile)} alt="Preview" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium text-gray-800 truncate">{attachedFile.name}</span>
                        <span className="text-xs text-gray-500">{Math.round(attachedFile.size / 1024)} KB</span>
                    </div>
                </div>
                <button onClick={() => onFileChange(null)} className="p-1 rounded-full hover:bg-gray-200 flex-shrink-0">
                    <span className="material-symbols-outlined text-base text-gray-500">close</span>
                </button>
            </div>
        )}

        <div className="bg-white rounded-[28px] p-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-200/80">
            <form onSubmit={handleSubmit}>
                <div className="relative flex items-end">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelected} className="hidden" accept="image/*" />
                    
                    <div className="flex-shrink-0 flex items-center gap-1 ml-2 mb-2">
                        <button 
                            type="button"
                            onClick={handleFileButtonClick}
                            disabled={isLoading}
                            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Attach file"
                            title="Attach file"
                        >
                            <span className="material-symbols-outlined text-gray-800 text-xl leading-none">attach_file</span>
                        </button>
                        <button
                            type="button"
                            onClick={onBoostUi}
                            disabled={isLoading}
                            className="px-3 h-10 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            aria-label="Boost UI"
                            title="Automatically improve the UI"
                        >
                            <span className="material-symbols-outlined text-purple-600 text-base leading-none">auto_awesome</span>
                            <span className="text-sm font-medium text-gray-800">Boost</span>
                        </button>
                    </div>

                    <textarea
                        rows={1}
                        placeholder="Describe a change..."
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="w-full bg-transparent border-none rounded-none py-3 pl-2 pr-12 text-base text-gray-900 placeholder-gray-500 focus:ring-0 resize-none"
                        style={{ lineHeight: '1.5rem', height: 'auto' }}
                    />
                    <button 
                        type="submit"
                        disabled={isLoading || (!inputValue.trim() && !attachedFile)}
                        className="absolute right-2 bottom-2 p-2 bg-gray-900 rounded-full hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        <span className="material-symbols-outlined text-white text-xl leading-none">arrow_upward</span>
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
