'use client';

import React, { useState } from 'react';

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
    <div className="absolute top-28 right-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col gap-2">
      <h3 className="text-md font-semibold text-gray-900 dark:text-white">Filter Markers</h3>
      <label htmlFor="paragliding" className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          id="paragliding"
          checked={showParagliding}
          onChange={handleParaglidingChange}
          className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <img src="/paraglider.png" alt="Paragliding" className="w-6 h-6" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Paragliding Spots</span>
      </label>
      <label htmlFor="weatherStation" className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          id="weatherStation"
          checked={showWeatherStations}
          onChange={handleWeatherStationChange}
          className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <img src="/windsockBlue.png" alt="Weather Station" className="w-6 h-6" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Weather Stations</span>
      </label>
    </div>
  );
};
