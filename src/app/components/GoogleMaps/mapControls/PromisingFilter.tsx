'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface PromisingFilterProps {
  isExpanded: boolean;
  onFilterChange: (filter: { day: number; timeRange: [number, number] } | null) => void;
  setIsExpanded: (isExpanded: boolean) => void;
}

const PromisingFilter: React.FC<PromisingFilterProps> = ({
  isExpanded,
  onFilterChange,
  setIsExpanded,
}) => {
  const [day, setDay] = useState(0);
  const [timeRange, setTimeRange] = useState<[number, number]>([6, 18]);

  const handleApply = () => {
    onFilterChange({ day, timeRange });
    setIsExpanded(false);
  };

  const handleReset = () => {
    onFilterChange(null);
    setIsExpanded(false);
    setDay(0);
    setTimeRange([6, 18]);
  };

  return (
    <div className="absolute top-3 right-16 z-10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-11 h-11 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)] flex items-center justify-center"
      >
        <Image src="/weather-icons/clearsky_day.svg" alt="Filter promising sites" width={32} height={32} />
      </button>

      {isExpanded && (
        <div className="absolute top-12 right-0 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-4 shadow-[var(--shadow-md)] w-64">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Day</h3>
            <div className="flex justify-around">
              {['Today', 'Tomorrow', 'In 2 days'].map((label, index) => (
                <label key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="day"
                    value={index}
                    checked={day === index}
                    onChange={() => setDay(index)}
                    className="form-radio"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Time of day</h3>
            <div className="p-2">
              <Slider
                range
                min={0}
                max={24}
                defaultValue={[6, 18]}
                value={timeRange}
                onChange={(value) => setTimeRange(value as [number, number])}
                marks={{ 0: '00:00', 6: '06:00', 12: '12:00', 18: '18:00', 24: '24:00' }}
                step={1}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-gray-300">Reset</button>
            <button onClick={handleApply} className="px-4 py-2 rounded-lg bg-blue-500 text-white">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromisingFilter;
