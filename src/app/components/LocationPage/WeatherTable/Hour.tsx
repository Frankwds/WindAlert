'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "@/app/components/shared/WindDirectionArrow";
import Details from "./Details";
import ValidationList from "@/app/components/LocationPage/WeatherTable/ValidationList";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useRef, useEffect } from "react";

interface HourProps {
  hour: ForecastCache1hr;
  windDirections: string[];
  altitude: number;
  showValidation?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const Hour: React.FC<HourProps> = ({
  hour,
  windDirections,
  altitude,
  showValidation = false,
  isExpanded,
  onToggle,
}) => {
  const isMobile = useIsMobile();
  const weatherIcon = getWeatherIcon(hour.weather_code);
  const hourRef = useRef<HTMLDivElement>(null);

  // Scroll to the hour when it expands
  useEffect(() => {
    if (isExpanded && hourRef.current) {
      setTimeout(() => {
        hourRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [isExpanded]);

  return (
    <div ref={hourRef} className={`space-y-1 ${!showValidation && !isExpanded ? 'relative after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-px after:bg-[var(--border)] last:after:hidden' : ''}`}>
      <div
        onClick={onToggle}
        className={`grid grid-cols-[3fr_3fr_3fr_3fr_3fr_3fr_1fr] p-1 items-center rounded-md transition-all ${!isMobile ? 'hover:bg-[var(--accent)]/5' : ''} cursor-pointer
           ${showValidation && hour.is_promising
            ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/30"
            : showValidation && !hour.is_promising
              ? "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/30"
              : ""
          }`}
      >
        {/* Time column */}
        <div className="font-semibold text-sm text-[var(--foreground)] text-center flex items-center justify-center gap-1">
          <div className="w-4 h-4 flex items-center justify-center">
            {showValidation && hour.validation_warnings && hour.validation_warnings.length > 0 ? (
              <div className="w-4 h-4 text-yellow-500 flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="w-4 h-4"></div>
            )}
          </div>
          {new Date(hour.time).getHours().toString().padStart(2, '0')}
        </div>

        {/* Weather icon column */}
        <div className="flex justify-center">
          {weatherIcon && (
            <Image
              src={weatherIcon.image}
              alt={weatherIcon.description}
              width={32}
              height={32}
            />
          )}
        </div>

        {/* Temperature column */}
        <div
          className={`text-lg font-semibold text-center ${Math.round(hour.temperature) <= 0 ? 'text-[var(--accent)]/70' : 'text-[var(--error)]/70'}`}
        >
          {Math.round(hour.temperature)}°C
        </div>

        {/* Precipitation column */}
        <div className="text-xs text-blue-500 text-center">
          {hour.precipitation_max !== 0
            ? `${hour.precipitation_min} - ${hour.precipitation_max}`
            : ''
          }
        </div>

        {/* Wind speed column */}
        <div className="text-center text-[var(--foreground)]">
          <span className="font-semibold text-sm">{Math.round(hour.wind_speed)}</span>
          {hour.wind_gusts !== undefined && (
            <span className="text-xs text-[var(--muted)] ml-1">({Math.round(hour.wind_gusts)})</span>
          )}
        </div>

        {/* Wind direction column */}
        <div className="flex justify-center">
          <WindDirectionArrow direction={hour.wind_direction} />
        </div>

        {/* Expand arrow column */}
        <div className="flex justify-center">
          <svg
            className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 py-4 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-[var(--shadow-sm)]">
          <ValidationList failuresCsv={hour.validation_failures} WarningsCsv={hour.validation_warnings} />
          <Details hour={hour} windDirections={windDirections} altitude={altitude} />
        </div>
      )}
    </div>
  );
};

export default Hour;

