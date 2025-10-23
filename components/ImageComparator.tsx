
import React, { useState, useRef, useEffect } from 'react';

interface ImageComparatorProps {
  originalImage: string;
  generatedImage: string | null;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ originalImage, generatedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newPosition = ((clientX - rect.left) / rect.width) * 100;
    newPosition = Math.max(0, Math.min(100, newPosition)); // Clamp between 0 and 100
    setSliderPosition(newPosition);
  };
  
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (isDragging) {
          handleMove(e.clientX);
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (isDragging) {
          handleMove(e.touches[0].clientX);
      }
  };

  useEffect(() => {
      const handleMouseUpGlobal = () => setIsDragging(false);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      return () => {
          window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
  }, []);

  if (!generatedImage) {
    return <img src={originalImage} alt="Original room" className="w-full h-full object-contain rounded-lg" />;
  }

  return (
    <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseLeave={handleMouseUp}
        className="relative w-full h-full select-none cursor-ew-resize overflow-hidden rounded-lg"
    >
      <img src={generatedImage} alt="AI generated design" className="absolute w-full h-full object-contain top-0 left-0" />
      <div className="absolute w-full h-full top-0 left-0" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <img src={originalImage} alt="Original room" className="w-full h-full object-contain" />
      </div>
      <div 
        className="absolute top-0 h-full w-1 bg-white cursor-ew-resize shadow-lg"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
      </div>
    </div>
  );
};
