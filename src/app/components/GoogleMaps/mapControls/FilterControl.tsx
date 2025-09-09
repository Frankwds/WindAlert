'use client';

import React from 'react';
import Image from 'next/image';

interface FilterControlProps {
  showParagliding: boolean;
  showWeatherStations: boolean;
  showSkyways?: boolean;
  onParaglidingFilterChange: (isVisible: boolean) => void;
  onWeatherStationFilterChange: (isVisible: boolean) => void;
  onSkywaysFilterChange?: (isVisible: boolean) => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({
  showParagliding,
  showWeatherStations,
  showSkyways = false,
  onParaglidingFilterChange,
  onWeatherStationFilterChange,
  onSkywaysFilterChange,
}) => {
  const handleParaglidingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onParaglidingFilterChange(e.target.checked);
  };

  const handleWeatherStationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeatherStationFilterChange(e.target.checked);
  };

  const handleSkywaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSkywaysFilterChange) {
      onSkywaysFilterChange(e.target.checked);
    }
  };

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-1">
          <label htmlFor="paragliding" className="flex items-center cursor-pointer hover:bg-[var(--accent)]/10 p-2 rounded transition-all duration-200 ease-in-out">
            <input
              type="checkbox"
              id="paragliding"
              checked={showParagliding}
              onChange={handleParaglidingChange}
              className="mr-2 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            />
            <Image src="/paraglider.png" alt="Paragliding" width={24} height={24} className="w-6 h-6" />
          </label>

          <label htmlFor="weatherStation" className="flex items-center cursor-pointer hover:bg-[var(--accent)]/10 p-2 rounded transition-all duration-200 ease-in-out">
            <input
              type="checkbox"
              id="weatherStation"
              checked={showWeatherStations}
              onChange={handleWeatherStationChange}
              className="mr-2 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            />
            <Image src="/windsockBlue.png" alt="Værstasjon" width={24} height={24} className="w-6 h-6" />
          </label>

          {onSkywaysFilterChange && (
            <label htmlFor="skyways" className="flex items-center cursor-pointer hover:bg-[var(--accent)]/10 p-2 rounded transition-all duration-200 ease-in-out">
              <input
                type="checkbox"
                id="skyways"
                checked={showSkyways}
                onChange={handleSkywaysChange}
                className="mr-2 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
              />
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
