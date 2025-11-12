import React, { useState, useEffect } from 'react';
import { suggestions } from '../data/suggestions';

interface SuggestionsCarouselProps {
  onAddToChat: (prompt: string) => void;
}

const SuggestionsCarousel: React.FC<SuggestionsCarouselProps> = ({ onAddToChat }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % suggestions.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const getCardStyle = (index: number) => {
    const offset = (activeIndex - index + suggestions.length) % suggestions.length;
    if (offset > 2) return { display: 'none' };
    
    const style: React.CSSProperties = {
      transform: `translateX(-50%) scale(${1 - offset * 0.1})`,
      top: `${offset * 20}px`,
      zIndex: suggestions.length - offset,
      opacity: offset === 0 ? 1 : 0.6,
      transition: 'all 0.5s ease-in-out',
      position: 'absolute',
      left: '50%',
    };
    return style;
  };

  return (
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-2">While you wait, here are some ideas...</h2>
        <div className="relative w-full max-w-md h-64">
        {suggestions.map((suggestion, index) => (
            <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md transform-gpu"
            style={getCardStyle(index)}
            >
            <h3 className="font-bold text-lg mb-2 text-gray-800">{suggestion.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{suggestion.description}</p>
            <button
                onClick={() => onAddToChat(suggestion.prompt)}
                className="w-full bg-gray-800 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
                Add to Chat
            </button>
            </div>
        ))}
        </div>
    </div>
  );
};

export default SuggestionsCarousel;
