'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "../WindDirectionArrow";
import HourlyWeatherDetails from "../HourlyWeatherDetails";
import { useState } from "react";

interface HourProps {
  hour: ForecastCache1hr;
  windDirections: string[];
  altitude: number;
}

const Hour: React.FC<HourProps> = ({
  hour,
  windDirections,
  altitude,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  const weatherIcon = getWeatherIcon(hour.weather_code);

  return (
    <div className="space-y-1">
      <div
        onClick={handleToggle}
        className="grid grid-cols-6 gap-4 items-center px-3 py-2 rounded-md bg-opacity-20 transition-all duration-200 ease-in-out hover:shadow-[var(--shadow-md)] cursor-pointer border border-transparent hover:border-[var(--accent)]"
        style={{
          background: 'rgba(var(--muted-rgb), 0.1)',
        }}
      >
        {/* Time column */}
        <div className="font-semibold text-sm text-[var(--foreground)] text-center">
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
          <span className="text-xs text-[var(--muted)] ml-1">({Math.round(hour.wind_gusts)})</span>
        </div>

        {/* Wind direction column */}
        <div className="flex justify-center">
          <WindDirectionArrow direction={hour.wind_direction} />
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-3 py-4 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-[var(--shadow-sm)]">
          <HourlyWeatherDetails hour={hour} windDirections={windDirections} altitude={altitude} />
        </div>
      )}
    </div>
  );
};

export default Hour;

