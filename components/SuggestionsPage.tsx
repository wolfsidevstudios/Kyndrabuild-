import React from 'react';
import { suggestions } from '../data/suggestions';

interface SuggestionsPageProps {
  onAddToChat: (prompt: string) => void;
}

const SuggestionsPage: React.FC<SuggestionsPageProps> = ({ onAddToChat }) => {
  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggestions</h1>
        <p className="text-gray-600 mb-8">Here are some ideas to enhance your application. Click "Add to Chat" to get started.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{suggestion.title}</h3>
              <p className="text-gray-600 text-sm mb-4 flex-grow">{suggestion.description}</p>
              <button
                onClick={() => onAddToChat(suggestion.prompt)}
                className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors mt-auto"
              >
                Add to Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
