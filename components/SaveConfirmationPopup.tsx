
import React from 'react';

interface SaveConfirmationPopupProps {
  isVisible: boolean;
  message: string;
}

const SaveConfirmationPopup: React.FC<SaveConfirmationPopupProps> = ({ isVisible, message }) => {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
    >
      <div className="bg-white rounded-full shadow-lg border border-gray-200/80 px-4 py-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-base text-green-500">check_circle</span>
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
    </div>
  );
};

export default SaveConfirmationPopup;
