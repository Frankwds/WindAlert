'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface FilterControlProps {
  onParaglidingFilterChange: (isVisible: boolean) => void;
  onWeatherStationFilterChange: (isVisible: boolean) => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({
  onParaglidingFilterChange,
  onWeatherStationFilterChange,
}) => {
  const [showParagliding, setShowParagliding] = useState(true);
  const [showWeatherStations, setShowWeatherStations] = useState(true);

  const handleParaglidingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isVisible = e.target.checked;
    setShowParagliding(isVisible);
    onParaglidingFilterChange(isVisible);
  };

  const handleWeatherStationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isVisible = e.target.checked;
    setShowWeatherStations(isVisible);
    onWeatherStationFilterChange(isVisible);
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
            <Image src="/windsockBlue.png" alt="Weather Station" width={24} height={24} className="w-6 h-6" />
          </label>
        </div>
      </div>
    </div>
  );
};
