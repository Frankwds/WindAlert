"use client";

import Image from "next/image";
import { getWeatherIcon } from "../../lib/utils/getWeatherIcons";
import WindDirectionArrow from "./WindDirectionArrow";
import { ForecastCache1hr } from "@/lib/supabase/types";

interface WeatherCardProps {
  hour: ForecastCache1hr;
  className?: string;
  compact?: boolean; // For use in headers
}

export default function WeatherCard({ hour, className = "", compact = false }: WeatherCardProps) {
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
          {!compact && (
            <p className="text-[var(--muted)] text-sm truncate">
              {weatherIcon?.description}
            </p>
          )}
        </div>
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


