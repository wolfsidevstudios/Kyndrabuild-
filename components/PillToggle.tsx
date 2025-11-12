import React from 'react';
import WorkspaceIcon from './icons/WorkspaceIcon';

type View = 'preview' | 'code' | 'suggestions' | 'workspace' | 'visual_edit';

interface PillToggleProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const PillToggle: React.FC<PillToggleProps> = ({ currentView, onViewChange }) => {
  const baseClasses = "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 flex items-center gap-2";
  const activeClasses = "bg-gray-900 text-white shadow-sm";
  const inactiveClasses = "text-gray-600 hover:bg-gray-200";

  return (
    <div className="flex items-center p-1 space-x-1 bg-gray-100 rounded-full">
      <button
        onClick={() => onViewChange('preview')}
        className={`${baseClasses} ${currentView === 'preview' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'preview'}
      >
        <span className="material-symbols-outlined text-base">visibility</span>
        Preview
      </button>
      <button
        onClick={() => onViewChange('visual_edit')}
        className={`${baseClasses} ${currentView === 'visual_edit' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'visual_edit'}
      >
        <span className="material-symbols-outlined text-base">design_services</span>
        Visual Edit
      </button>
      <button
        onClick={() => onViewChange('code')}
        className={`${baseClasses} ${currentView === 'code' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'code'}
      >
        <span className="material-symbols-outlined text-base">code</span>
        Code
      </button>
       <button
        onClick={() => onViewChange('suggestions')}
        className={`${baseClasses} ${currentView === 'suggestions' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'suggestions'}
      >
        <span className="material-symbols-outlined text-base">tips_and_updates</span>
        Suggestions
      </button>
       <button
        onClick={() => onViewChange('workspace')}
        className={`${baseClasses} ${currentView === 'workspace' ? activeClasses : inactiveClasses}`}
        aria-pressed={currentView === 'workspace'}
      >
        <WorkspaceIcon className="w-4 h-4" />
        Workspace
      </button>
    </div>
  );
};

export default PillToggle;
