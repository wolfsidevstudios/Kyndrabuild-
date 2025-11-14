import React from 'react';

interface SlideUpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'default' | 'full';
}

const SlideUpPanel: React.FC<SlideUpPanelProps> = ({ isOpen, onClose, title, children, size = 'default' }) => {

  const desktopWidthClass = size === 'full' ? 'lg:w-[600px]' : 'lg:w-[400px]';
  const mobileHeightClass = size === 'full' ? 'h-[calc(100%-60px)]' : 'h-[60%]';

  return (
    <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
    >
      <div 
        className={`absolute bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
                    bottom-0 left-0 right-0 rounded-t-2xl ${mobileHeightClass}
                    lg:top-0 lg:bottom-0 lg:right-auto lg:left-0 lg:h-full lg:rounded-t-none lg:rounded-r-2xl
                    ${desktopWidthClass}
                    ${isOpen 
                        ? 'translate-y-0 lg:translate-x-0' 
                        : 'translate-y-full lg:translate-y-0 lg:-translate-x-full'
                    }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </header>

        <div className="flex-grow overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default SlideUpPanel;