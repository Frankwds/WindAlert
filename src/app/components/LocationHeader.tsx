'use client';

import { useState } from 'react';
import WindCompass from './windCompass';

interface LocationHeaderProps {
  name: string;
  description: string;
  windDirections: string[];
}

export default function LocationHeader({ name, description, windDirections }: LocationHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold mb-4">{name}</h1>
      <div className="w-32 h-32 md:w-48 md:h-48 mb-4 float-right">
        <WindCompass allowedDirections={windDirections} />
      </div>
      <div className="relative">
        <div
          className={`break-words break-long transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-38 md:max-h-56 overflow-hidden'
            }`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {description.length > 100 && (
          <div className={`relative ${isExpanded ? 'hidden' : 'block'}`}>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-gray-900 dark:to-transparent" />
            <button
              onClick={() => setIsExpanded(true)}
              className="absolute bottom-0 left-0 right-0 h-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center"
            >
              Show more
            </button>
          </div>
        )}
        {isExpanded && (
          <button
            onClick={() => {
              setIsExpanded(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-2 py-2 flex items-center justify-center"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
