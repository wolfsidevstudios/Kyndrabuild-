
import React, { useState, useEffect, useRef } from 'react';

type ChatMessage = {
  author: 'user' | 'ai';
  content: string;
};

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800">
      <header className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
      </header>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`p-3 rounded-2xl max-w-sm ${
              msg.author === 'user' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-gray-100 text-gray-800">
                <div className="flex items-center space-x-1">
                    <span className="text-sm">Thinking</span>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <footer className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Ask me to change the app..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="w-full bg-gray-100 border border-gray-200 rounded-full py-2.5 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-shadow disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-gray-900 rounded-full hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-white text-lg leading-none">arrow_upward</span>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatPanel;