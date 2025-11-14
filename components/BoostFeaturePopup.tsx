
import React, { useState, useRef, useEffect, useCallback } from 'react';

const BEFORE_IMAGE_URL = 'https://i.ibb.co/23CpwyrF/Screenshot-2025-11-12-124927.png';
const AFTER_IMAGE_URL = 'https://i.ibb.co/cSzVK80s/Screenshot-2025-11-12-125750.png';

interface BoostFeaturePopupProps {
  onClose: () => void;
}

const BoostFeaturePopup: React.FC<BoostFeaturePopupProps> = ({ onClose }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
  };

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMove, handleMouseUp]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-1.5 bg-black/30 rounded-full text-white hover:bg-black/60 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        
        <div 
          ref={containerRef}
          className="relative w-full aspect-[16/9] select-none overflow-hidden"
          onMouseLeave={handleMouseUp}
        >
          {/* Before Image (bottom layer) */}
          <img src={BEFORE_IMAGE_URL} alt="Before UI Boost" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          
          {/* After Image (top layer, clipped) */}
          <div 
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img src={AFTER_IMAGE_URL} alt="After UI Boost" className="absolute inset-0 w-full h-full object-cover" />
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-20"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center pointer-events-none ring-2 ring-black/10">
              <span className="material-symbols-outlined text-gray-700 text-2xl font-semibold select-none">drag_handle</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-5 text-center">
          <p className="font-semibold text-lg">Try the all new Boost feature ✨</p>
        </div>
      </div>
    </div>
  );
};

export default BoostFeaturePopup;
