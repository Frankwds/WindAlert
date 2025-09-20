'use client';

import React from 'react';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

interface ZoomControlsProps {
  map: google.maps.Map | null;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ map }) => {
  const isMobile = useIsMobile();
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
    <div className={`absolute bottom-0 right-0`}>
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className={`w-8 h-8 bg-transparent ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} border-none rounded-md cursor-pointer text-[var(--foreground)] flex items-center justify-center font-bold text-lg select-none`}>
            +
          </button>

          <button
            onClick={handleZoomOut}
            className={`w-8 h-8 bg-transparent ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} border-none rounded-md cursor-pointer text-[var(--foreground)] flex items-center justify-center font-bold text-lg select-none`}>
            −
          </button>
        </div>
      </div>
    </div>
  );
};
