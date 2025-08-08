"use client";

import { useState } from "react";
import Image from "next/image";
import { HourlyData } from "../api/cron/types";
import { getWeatherIcon } from "../lib/weather-icons";
import { getWindDirection } from "../lib/wind";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  hour?: HourlyData;
}

export default function Collapsible({
  title,
  children,
  className,
  hour,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  const weatherIcon = hour
    ? getWeatherIcon(hour.weatherData.weatherCode, hour.weatherData.isDay)
    : null;

  return (
    <div className="border border-gray-700 rounded-lg mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-4 hover:bg-gray-700 focus:outline-none ${className} ${
          isOpen ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {weatherIcon && (
              <Image
                src={weatherIcon.image}
                alt={weatherIcon.description}
                width={70}
                height={70}
                className="mr-4"
              />
            )}
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          {hour && (
            <div className="text-right">
              <div>
                Wind: {Math.round(hour.weatherData.windSpeed10m)} (
                {Math.round(hour.weatherData.windGusts10m)}) m/s
              </div>
              <div>
                Direction: {getWindDirection(hour.weatherData.windDirection10m)}
              </div>
            </div>
          )}
        </div>
      </button>
      {isOpen && <div className="bg-gray-800 rounded-b-lg">{children}</div>}
    </div>
  );
}
