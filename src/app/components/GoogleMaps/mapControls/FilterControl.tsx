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
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({
  showParagliding,
  showWeatherStations,
  showSkyways = false,
  onParaglidingFilterChange,
  onWeatherStationFilterChange,
  onSkywaysFilterChange,
  isOpen,
  onToggle,
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

  const toggleDropdown = () => {
    onToggle(!isOpen);
  };

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-[var(--shadow-md)]">
        {/* Toggle Button */}
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-4 p-2 hover:bg-[var(--accent)]/10 transition-all duration-200 ease-in-out rounded-lg cursor-pointer min-w-[72px]"
          aria-label="Toggle filters"
        >
          {/* Filters Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--foreground)]"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
          </svg>

          {/* Arrow Icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--muted)] transition-transform duration-200 ease-in-out ${isOpen ? 'rotate-180' : ''
              }`}
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="border-t border-[var(--border)] p-1">
            <div className="flex flex-col gap-1">
              <label htmlFor="paragliding" className="flex items-center cursor-pointer hover:bg-[var(--accent)]/10 p-2 rounded">
                <input
                  type="checkbox"
                  id="paragliding"
                  checked={showParagliding}
                  onChange={handleParaglidingChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <Image src="/paraglider.png" alt="Paragliding" width={24} height={24} className="w-6 h-6" />
              </label>

              <label htmlFor="weatherStation" className="flex items-center cursor-pointer hover:bg-[var(--accent)]/10 p-2 rounded">
                <input
                  type="checkbox"
                  id="weatherStation"
                  checked={showWeatherStations}
                  onChange={handleWeatherStationChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <Image src="/windsockBlue.png" alt="Værstasjon" width={24} height={24} className="w-6 h-6" />
              </label>

              <label htmlFor="skyways" className="flex items-center cursor-pointer hover:bg-[var(--accent)]/10 p-2 rounded">
                <input
                  type="checkbox"
                  id="skyways"
                  checked={showSkyways}
                  onChange={handleSkywaysChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <Image src="/thermalkk7.webp" alt="Skyways" width={24} height={24} className="w-6 h-6" />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
