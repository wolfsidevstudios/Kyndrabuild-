
import React, { useEffect } from 'react';
import type { Suggestion } from '../../data/suggestions';

interface SuggestionsPageProps {
  onAddToChat: (prompt: string) => void;
  suggestions: Suggestion[];
  isLoading: boolean;
  onGenerate: () => void;
}

const Blob = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <div
        className={`absolute -z-10 rounded-full mix-blend-multiply filter blur-2xl opacity-20 ${className}`}
        style={style}
    ></div>
);

const SuggestionsPage: React.FC<SuggestionsPageProps> = ({ onAddToChat, suggestions, isLoading, onGenerate }) => {
  useEffect(() => {
    // Generate suggestions when the component is shown and the list is empty.
    if (suggestions.length === 0 && !isLoading) {
        onGenerate();
    }
  }, []); // The dependency array is empty to ensure this runs only once on mount.

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-lg animate-pulse">
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
              <div className="h-9 bg-gray-300 rounded-lg w-full mt-auto"></div>
            </div>
          ))}
        </div>
      );
    }

    if (suggestions.length === 0) {
        return (
            <div className="text-center py-12 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/50">
                <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">psychology</span>
                <h3 className="text-xl font-semibold text-gray-800">Couldn't generate suggestions</h3>
                <p className="text-gray-500 mt-2">There might have been an issue. Please try refreshing.</p>
            </div>
        )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-105">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{suggestion.title}</h3>
            <p className="text-gray-700 text-sm mb-4 flex-grow">{suggestion.description}</p>
            <button
              onClick={() => onAddToChat(suggestion.prompt)}
              className="w-full bg-white/80 text-gray-800 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors mt-auto border border-white/50 shadow"
            >
              Add to Chat
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative p-6 sm:p-8 h-full overflow-y-auto bg-gray-50 isolate">
      <Blob className="bg-sky-300" style={{ width: '30rem', height: '30rem', top: '-5rem', left: '-10rem' }} />
      <Blob className="bg-yellow-200" style={{ width: '25rem', height: '25rem', top: '10rem', right: '-10rem' }} />
      <Blob className="bg-pink-300" style={{ width: '20rem', height: '20rem', bottom: '5rem', left: '5rem' }} />
      <Blob className="bg-green-200" style={{ width: '25rem', height: '25rem', bottom: '-5rem', right: '0rem' }} />
      <Blob className="bg-orange-200" style={{ width: '15rem', height: '15rem', top: '20rem', left: '40%' }} />

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Suggestions</h1>
                <p className="text-gray-600">Here are some AI-generated ideas to enhance your application.</p>
            </div>
            <button 
                onClick={onGenerate} 
                disabled={isLoading} 
                className="flex items-center gap-2 bg-white/80 text-gray-800 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-white transition-colors border border-white/50 shadow disabled:opacity-50 disabled:cursor-wait"
            >
                <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                Refresh
            </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SuggestionsPage;
