'use client';

import { MinimalForecast } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "../WindDirectionArrow";
import { useState, useRef, useEffect } from "react";

interface MinimalHourlyWeatherProps {
  weatherData: MinimalForecast[];
  timezone: string;
}

const MinimalHourlyWeather: React.FC<MinimalHourlyWeatherProps> = ({
  weatherData,
  timezone,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [activeDay, setActiveDay] = useState<string | null>(() => {
    if (weatherData && weatherData.length > 0) {
      const firstDay = new Date(weatherData[0].time).toLocaleDateString([], {
        weekday: 'short',
        timeZone: timezone,
      });
      return firstDay;
    }
    return null;
  });

  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 border border-[var(--border)]">
        <div className="text-center py-8">
          <div className="text-[var(--foreground)] mb-4">
            No hourly weather data available.
          </div>
        </div>
      </div>
    );
  }

  const groupedByDay = weatherData.reduce((acc, hour) => {
    const day = new Date(hour.time).toLocaleDateString([], {
      weekday: 'short',
      timeZone: timezone,
    });
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(hour);
    return acc;
  }, {} as Record<string, MinimalForecast[]>);

  const dataRows = [
    {
      getValue: (hour: MinimalForecast) => {
        const weatherIcon = getWeatherIcon(hour.weather_code);
        return weatherIcon ? (
          <Image
            src={weatherIcon.image}
            alt={weatherIcon.description}
            width={32}
            height={32}
            className="mx-auto"
          />
        ) : null;
      },
    },
    {
      getValue: (hour: MinimalForecast) =>
        `${Math.round(hour.temperature)}°`,
    },
    {
      getValue: (hour: MinimalForecast) =>
        `${Math.round(hour.wind_speed)} (${Math.round(
          hour.wind_gusts
        )})`,
    },
    {
      getValue: (hour: MinimalForecast) => (
        <WindDirectionArrow
          direction={hour.wind_direction}
          size={24}
          className="mx-auto"
          color="var(--foreground)"
        />
      ),
    },
  ];

  // Scroll to center when active day changes
  useEffect(() => {
    if (activeDay && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const table = container.querySelector('table');
      if (table) {
        const scrollLeft = (table.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = scrollLeft;
      }
    }
  }, [activeDay]);


  return (
    <div className="bg-[var(--background)] rounded-lg">
      <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
        {Object.keys(groupedByDay).map((day, index) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 py-1.5 px-3 transition-all cursor-pointer capitalize ${index === 0 ? "rounded-l-md" : ""
              } ${index === Object.keys(groupedByDay).length - 1 ? "rounded-r-md" : ""
              } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
              } ${activeDay === day
                ? "bg-[var(--background)] shadow-[var(--shadow-sm)] font-medium"
                : "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50"
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {activeDay && (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-thin transition-all duration-200"
        >
          <table className="min-w-full text-sm text-center">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {groupedByDay[activeDay].map((hour, colIndex) => (
                  <th key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
                    {new Date(hour.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: timezone,
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-[var(--border)] last:border-b-0`}
                >
                  {groupedByDay[activeDay].map((hour, colIndex) => (
                    <td key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)]">
                      <div className="w-12 flex items-center justify-center mx-auto">
                        {row.getValue(hour)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MinimalHourlyWeather;
