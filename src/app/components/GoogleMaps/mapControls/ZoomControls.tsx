'use client';

import React from 'react';

interface ZoomControlsProps {
  map: google.maps.Map | null;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ map, className = '' }) => {
  const handleZoomIn = () => {
    if (!map) return;
    const currentZoom = map.getZoom() || 7;
    map.setZoom(currentZoom + 1);
  };

  const handleZoomOut = () => {
    if (!map) return;
    const currentZoom = map.getZoom() || 7;
    map.setZoom(currentZoom - 1);
  };

  if (!map) return null;

  return (
    <div className={`absolute bottom-3 right-3 z-10 ${className}`}>
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-transparent hover:bg-[var(--accent)]/10 border-none rounded-md cursor-pointer text-[var(--foreground)] hover:text-[var(--accent)] transition-all duration-200 ease-in-out flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          >
            +
          </button>

          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-transparent hover:bg-[var(--accent)]/10 border-none rounded-md cursor-pointer text-[var(--foreground)] hover:text-[var(--accent)] transition-all duration-200 ease-in-out flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};
