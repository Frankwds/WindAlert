"use client";

import Image from "next/image";
import { HourlyData } from "../../lib/openMeteo/types";
import { getWeatherIcon } from "../../lib/utils/getWeatherIcons";
import { getWindDirection } from "../../lib/utils/getWindDirection";
import WindDirectionArrow from "./WindDirectionArrow";

interface WeatherCardProps {
  hour: HourlyData;
  className?: string;
  compact?: boolean; // For use in headers
}

export default function WeatherCard({ hour, className = "", compact = false }: WeatherCardProps) {
  const weatherIcon = getWeatherIcon(hour.weatherData.weatherCode);

  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex items-center flex-1">
        {weatherIcon && (
          <Image
            src={weatherIcon.image}
            alt={weatherIcon.description}
            width={40}
            height={40}
            className="mr-3"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold">
            {hour.weatherData.time.split("T")[1]}
          </h3>
          {!compact && <p className="text-gray-300">{weatherIcon?.description}</p>}
        </div>
      </div>
      <div className="text-sm ml-auto">
        <div className="flex items-center gap-2">
          <WindDirectionArrow
            direction={hour.weatherData.windDirection10m}
            size={20}
          />
          <span>
            {Math.round(hour.weatherData.windSpeed10m)} (
            {Math.round(hour.weatherData.windGusts10m)}) m/s
          </span>
        </div>
      </div>
    </div>
  );
}


