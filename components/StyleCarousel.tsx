
import React, { useState } from 'react';
import { Style } from '../types';

interface StyleCarouselProps {
  styles: Style[];
  onStyleSelect: (styleName: string) => void;
  disabled: boolean;
}

export const StyleCarousel: React.FC<StyleCarouselProps> = ({ styles, onStyleSelect, disabled }) => {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleSelect = (styleName: string) => {
    setSelectedStyle(styleName);
    onStyleSelect(styleName);
  };
    
  return (
    <div className="w-full">
        <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">Choose a Style</h2>
        <div className="flex space-x-4 p-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {styles.map((style) => (
            <button
            key={style.name}
            onClick={() => handleSelect(style.name)}
            disabled={disabled}
            className={`flex-shrink-0 snap-center group rounded-lg overflow-hidden shadow-md transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${selectedStyle === style.name ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
            >
            <div className="relative w-48 h-32">
                <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-300 flex items-end p-2">
                <p className="text-white font-semibold text-sm">{style.name}</p>
                </div>
            </div>
            </button>
        ))}
        </div>
    </div>
  );
};
