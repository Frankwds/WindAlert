'use client';

import React from 'react';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

interface FullscreenControlProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const FullscreenControl: React.FC<FullscreenControlProps> = ({ isFullscreen, toggleFullscreen }) => {
  const isMobile = useIsMobile();
  return (
    <div className={`absolute bottom-0 right-12`}>
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-1">
          <button
            onClick={toggleFullscreen}
            className={`w-8 h-8 bg-transparent ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} border-none rounded-md cursor-pointer text-[var(--foreground)] duration-200 ease-in-out flex items-center justify-center font-bold text-lg`}
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
