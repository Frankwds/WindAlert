"use client";

import Image from "next/image";
import { getWeatherIcon } from "../../lib/utils/getWeatherIcons";
import WindDirectionArrow from "./WindDirectionArrow";
import { ForecastCache1hr } from "@/lib/supabase/types";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface WeatherCardProps {
  hour: ForecastCache1hr;
  className?: string;

}

export default function WeatherCard({ hour, className = "" }: WeatherCardProps) {
  const weatherIcon = getWeatherIcon(hour.weather_code);

  return (
    <div className={`flex items-center w-full gap-4 ${className}`}>
      <div className="flex items-center flex-1 gap-3">
        {weatherIcon && (
          <div className="flex-shrink-0">
            <Image
              src={weatherIcon.image}
              alt={weatherIcon.description}
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {new Date(hour.time).toLocaleTimeString([], {
              hour: "2-digit",
              hour12: false,
            })}
          </h3>
        </div>
        <div className="text-xs text-blue-500 text-center">
          {hour.is_yr_data ? 'YR' : 'ECMWF'}
        </div>
        {hour.validation_warnings.length > 0 && hour.validation_failures.length === 0 && (
          <ExclamationTriangleIcon className="w-5 h-5 text-[var(--warning)]" title="Validation warnings" />
        )}
      </div>

      {/* Precipitation column */}
      <div className="text-xs text-blue-500 text-center">
        {hour.precipitation_max !== 0
          ? `${hour.precipitation_min} - ${hour.precipitation_max}`
          : ''
        }
      </div>

      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <WindDirectionArrow
            direction={hour.wind_direction}
            size={20}
            color="var(--foreground)"
          />
          <div className="text-sm">
            <div className="font-medium">
              {Math.round(hour.wind_speed)} ( {Math.round(hour.wind_gusts)}) m/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


