
import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="relative h-[90%] max-h-[700px] aspect-[9/19.5] bg-gray-900 rounded-[40px] shadow-2xl p-2 border-2 border-gray-700">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[40%] max-w-[120px] h-6 bg-black rounded-b-lg z-10"></div>
      <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default MobileFrame;
