'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { ButtonAccept, ButtonNeutral } from '@/app/components/shared';

export type WeatherCondition = 'clearsky_day' | 'fair_day' | 'partlycloudy_day' | 'cloudy';

export const WEATHER_CONDITIONS: WeatherCondition[] = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];

interface PromisingFilterProps {
  isExpanded: boolean;
  onFilterChange: (filter: { selectedDay: number; selectedTimeRange: [number, number], minPromisingHours: number, selectedWeatherConditions: WeatherCondition[] } | null) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  initialFilter: { selectedDay: number; selectedTimeRange: [number, number], minPromisingHours: number, selectedWeatherConditions: WeatherCondition[] } | null;
  closeOverlays: (options?: { keep?: string }) => void;
}

const PromisingFilter: FC<PromisingFilterProps> = ({
  isExpanded,
  onFilterChange,
  setIsExpanded,
  initialFilter,
  closeOverlays: onCloseOverlays,
}) => {
  const isMobile = useIsMobile();
  const currentHour = useMemo(() => new Date().getHours(), []);
  const [selectedDay, setSelectedDay] = useState(initialFilter?.selectedDay ?? 0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[number, number]>(initialFilter?.selectedTimeRange ?? [currentHour + 1, Math.min(24, currentHour + 7)]);
  const [minPromisingHours, setMinPromisingHours] = useState(initialFilter?.minPromisingHours ?? 3);
  const [selectedWeatherConditions, setSelectedWeatherConditions] = useState<WeatherCondition[]>(initialFilter?.selectedWeatherConditions ?? []);
  const [isFilterActive, setIsFilterActive] = useState(!!initialFilter);

  const dayLabels = useMemo(() => {
    const now = new Date();
    const inTwoDays = new Date(now);
    inTwoDays.setDate(now.getDate() + 2);
    const weekday = inTwoDays.toLocaleDateString('nb-NO', { weekday: 'long' });
    return ['I dag', 'I morgen', weekday.charAt(0).toUpperCase() + weekday.slice(1)];
  }, []);

  const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;


  const handleApply = () => {
    onFilterChange({ selectedDay, selectedTimeRange, minPromisingHours, selectedWeatherConditions });
    setIsFilterActive(true);
    setIsExpanded(false);
  };

  const handleReset = () => {
    onFilterChange(null);
    setIsFilterActive(false);
    setIsExpanded(false);
    setSelectedDay(0);
    setSelectedTimeRange([6, 18]);
    setSelectedWeatherConditions([]);
  };

  useEffect(() => {
    if (initialFilter) return;
    if (selectedDay === 0) {
      setSelectedTimeRange([currentHour + 1, Math.min(24, currentHour + 7)]);
    } else {
      setSelectedTimeRange([12, 18]);
    }
  }, [selectedDay, currentHour, initialFilter]);

  useEffect(() => {
    if (!isExpanded) {
      setSelectedDay(initialFilter?.selectedDay ?? 0);
      setSelectedTimeRange(initialFilter?.selectedTimeRange ?? [currentHour + 1, Math.min(24, currentHour + 7)]);
      setMinPromisingHours(initialFilter?.minPromisingHours ?? 3);
      setSelectedWeatherConditions(initialFilter?.selectedWeatherConditions ?? []);
    }
  }, [isExpanded, initialFilter, currentHour]);

  return (
    <div className="absolute top-3 right-3 z-10">
      <button
        onClick={() => {
          if (!isExpanded) {
            onCloseOverlays({ keep: 'promisingfilter' });
          }
          setIsExpanded(!isExpanded);
        }}
        className="w-11 h-11 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)] flex items-center justify-center cursor-pointer select-none"
      >
        <div className="relative">
          <Image src="/weather-icons/clearsky_day.svg" alt="Filter promising sites" width={32} height={32} />
          {isFilterActive && (
            <Image
              src="/weather-icons/checkbox.svg"
              alt="Filter active"
              width={32}
              height={32}
              className="absolute inset-0 opacity-70"
            />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="absolute top-12 right-0 bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-4 shadow-[var(--shadow-md)] w-72 sm:w-80">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Vis starter med lovende vær:</h3>
            <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
              {dayLabels.map((label, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedDay(index)}
                  className={`flex-1 py-1.5 px-3 text-sm font-medium cursor-pointer ${index === 0 ? "rounded-l-md" : ""
                    } ${index === dayLabels.length - 1 ? "rounded-r-md" : ""
                    } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
                    } ${selectedDay === index
                      ? "bg-[var(--background)] shadow-[var(--shadow-sm)]"
                      : !isMobile ? "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50" : ""
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">{formatHour(selectedTimeRange[0])} - {formatHour(selectedTimeRange[1])}</h3>
            <div className="p-2">
              <Slider
                range
                min={selectedDay === 0 ? currentHour : 0}
                max={24}
                defaultValue={[selectedDay === 0 ? currentHour + 1 : 0, Math.min(24, currentHour + 7)]}
                value={selectedTimeRange}
                onChange={(value) => setSelectedTimeRange(value as [number, number])}
                marks={(() => {
                  const marks: Record<number, string> = {};
                  if (selectedDay === 0) {
                    // For today, only show marks from current hour onwards
                    for (let i = Math.ceil(currentHour / 6) * 6; i <= 24; i += 6) {
                      if (i >= currentHour) {
                        marks[i] = formatHour(i);
                      }
                    }
                    // Always show the current hour mark
                    marks[currentHour] = formatHour(currentHour);
                  } else {
                    // For other days, show standard marks
                    marks[0] = '00:00';
                    marks[6] = '06:00';
                    marks[12] = '12:00';
                    marks[18] = '18:00';
                    marks[24] = '24:00';
                  }
                  return marks;
                })()}
                step={1}
              />
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold mb-2">Minst {minPromisingHours} timer i strekk</h3>
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

          <div className="mb-4">
            <div className="flex gap-2">
              {WEATHER_CONDITIONS.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => {
                    setSelectedWeatherConditions(prev =>
                      prev.includes(condition)
                        ? prev.filter(c => c !== condition)
                        : [...prev, condition]
                    );
                  }}
                  className="relative w-12 h-12 bg-[var(--background)]/50 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-sm)] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--background)]/70"
                >
                  <Image src={`/weather-icons/${condition}.svg`} alt={condition} width={32} height={32} />
                  {selectedWeatherConditions.includes(condition) && (
                    <Image
                      src="/weather-icons/checkbox.svg"
                      alt="Selected"
                      width={32}
                      height={32}
                      className="absolute inset-0 opacity-70"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <ButtonNeutral
              onClick={handleReset}
              title="Tilbakestill"
              className="flex-1"
              isMobile={isMobile}
            />
            <ButtonAccept
              onClick={handleApply}
              title="Bruk"
              className="flex-1"
              isMobile={isMobile}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PromisingFilter;
