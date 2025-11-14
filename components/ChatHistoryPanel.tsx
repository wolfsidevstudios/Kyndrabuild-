
import React from 'react';
import type { ChatMessage } from '../../App';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatMessage[];
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({ isOpen, onClose, chatHistory }) => {
  return (
    <div 
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out rounded-t-2xl h-[85%]`}
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-3 rounded-2xl max-w-md ${
                msg.author === 'user' 
                  ? 'bg-blue-50 text-gray-800 border border-blue-100' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.author === 'ai' 
                  ? <MarkdownRenderer content={msg.content} />
                  : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryPanel;
