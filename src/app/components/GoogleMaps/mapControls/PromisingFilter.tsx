'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface PromisingFilterProps {
  isExpanded: boolean;
  onFilterChange: (filter: { day: number; timeRange: [number, number], minPromisingHours: number } | null) => void;
  setIsExpanded: (isExpanded: boolean) => void;
}

const PromisingFilter: FC<PromisingFilterProps> = ({
  isExpanded,
  onFilterChange,
  setIsExpanded,
}) => {
  const currentHour = useMemo(() => new Date().getHours(), []);
  const [day, setDay] = useState(0);
  const [timeRange, setTimeRange] = useState<[number, number]>([currentHour + 1, Math.min(24, currentHour + 7)]);
  const [minPromisingHours, setMinPromisingHours] = useState(3);

  const dayLabels = useMemo(() => {
    const now = new Date();
    const inTwoDays = new Date(now);
    inTwoDays.setDate(now.getDate() + 2);
    const weekday = inTwoDays.toLocaleDateString('nb-NO', { weekday: 'long' });
    return ['Today', 'Tomorrow', weekday.charAt(0).toUpperCase() + weekday.slice(1)];
  }, []);

  const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;


  const handleApply = () => {
    onFilterChange({ day, timeRange, minPromisingHours });
    setIsExpanded(false);
  };

  const handleReset = () => {
    onFilterChange(null);
    setIsExpanded(false);
    setDay(0);
    setTimeRange([6, 18]);
  };

  useEffect(() => {
    day === 0 ? setTimeRange([currentHour + 1, Math.min(24, currentHour + 7)]) : setTimeRange([12, 18]);
  }, [day]);

  return (
    <div className="absolute top-3 right-16 z-10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-11 h-11 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)] flex items-center justify-center"
      >
        <Image src="/weather-icons/clearsky_day.svg" alt="Filter promising sites" width={32} height={32} />
      </button>

      {isExpanded && (
        <div className="absolute top-12 right-0 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-4 shadow-[var(--shadow-md)] w-72 sm:w-80">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Promising</h3>
            <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
              {dayLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDay(index)}
                  className={`flex-1 py-1.5 px-3 text-sm font-medium transition-all cursor-pointer ${index === 0 ? "rounded-l-md" : ""
                    } ${index === dayLabels.length - 1 ? "rounded-r-md" : ""
                    } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
                    } ${day === index
                      ? "bg-[var(--background)] shadow-[var(--shadow-sm)]"
                      : "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Time of day: {formatHour(timeRange[0])} - {formatHour(timeRange[1])}</h3>
            <div className="p-2">
              <Slider
                range
                min={day === 0 ? currentHour : 0}
                max={24}
                defaultValue={[day === 0 ? currentHour + 1 : 0, Math.min(24, currentHour + 7)]}
                value={timeRange}
                onChange={(value) => setTimeRange(value as [number, number])}
                marks={{ 0: '00:00', 6: '06:00', 12: '12:00', 18: '18:00', 24: '24:00' }}
                step={1}
              />
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold mb-2">Minimum Promising Hours: {minPromisingHours}</h3>
            <div className="p-2 flex items-center">
              <button onClick={() => setMinPromisingHours(prev => Math.max(1, prev - 1))} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-lg">-</button>
              <div className="flex-grow px-4">
                <Slider
                  min={1}
                  max={6}
                  value={minPromisingHours}
                  onChange={(value) => setMinPromisingHours(value as number)}
                  step={1}
                />
              </div>
              <button onClick={() => setMinPromisingHours(prev => Math.min(6, prev + 1))} className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-lg">+</button>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <button onClick={handleReset} className="px-3 py-2 rounded-md border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer">Reset</button>
            <button onClick={handleApply} className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors cursor-pointer">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromisingFilter;
