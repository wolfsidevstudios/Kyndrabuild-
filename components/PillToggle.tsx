
import React from 'react';

type View = 'preview' | 'code';

interface PillToggleProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const PillToggle: React.FC<PillToggleProps> = ({ currentView, onViewChange }) => {
  const baseClasses = "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800";
  const activeClasses = "bg-gray-900 text-white shadow-sm";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200";

  return (
    <div className="flex items-center p-1 space-x-1 bg-gray-100 rounded-full">
      <button
        onClick={() => onViewChange('preview')}
        className={`${baseClasses} ${currentView === 'preview' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'preview'}
      >
        App Preview
      </button>
      <button
        onClick={() => onViewChange('code')}
        className={`${baseClasses} ${currentView === 'code' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'code'}
      >
        Code
      </button>
    </div>
  );
};

export default PillToggle;