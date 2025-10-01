'use client';

import { MinimalForecast } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "@/app/components/shared/WindDirectionArrow";
import { useDataGrouping } from "@/lib/hooks/useDataGrouping";
import { useMemo } from "react";

interface MinimalHourlyWeatherProps {
  forecast: MinimalForecast[];
  timezone: string;
}

const MinimalHourlyWeather: React.FC<MinimalHourlyWeatherProps> = ({
  forecast,
  timezone,
}) => {
  // Filter to future hours on the client to avoid SSR hydration mismatches
  const filteredForecast = useMemo(() => {
    const cutoff = Date.now() - 60 * 60 * 1000; // include previous hour
    return forecast.filter((f) => new Date(f.time).getTime() >= cutoff);
  }, [forecast]);

  const {
    groupedByDay,
    activeDay,
    setActiveDay,
    scrollContainerRef,
  } = useDataGrouping({
    data: filteredForecast,
    timezone,
    timeField: 'time',
    sortOrder: 'asc',
  });

  // Create visual representation of promising hours (10:00-22:00)
  const getPromisingHoursVisual = (day: string) => {
    const allHours = groupedByDay[day];
    const relevantHours = allHours.filter(hour => {
      return hour.is_day === 1
    });
    if (relevantHours.length <= 2) {
      return [];
    }

    const segments = [];
    for (const hour of relevantHours) {
      const isSunny = ['clearsky_day', 'fair_day', 'partlycloudy_day'].includes(hour.weather_code);
      segments.push(
        <div
          key={hour.time}
          className={`h-1.5 flex-1 ${isSunny && hour.is_promising ? 'bg-[var(--wind-light)]' : hour.is_promising ? 'bg-[var(--wind-calm)]' : 'bg-red-500'} 
            }`}
        />
      );
    }

    return segments;
  };

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
        hour.wind_gusts !== undefined && hour.wind_gusts !== null
          ? `${Math.round(hour.wind_speed)} (${Math.round(hour.wind_gusts)})`
          : `${Math.round(hour.wind_speed)}`,
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

  return (
    <div className="bg-[var(--background)] rounded-lg">
      <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
        {Object.keys(groupedByDay).map((day, index) => (
          groupedByDay[day].length > 2 && (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-1.5 px-3 cursor-pointer capitalize ${index === 0 ? "rounded-l-md" : ""
                } ${index === Object.keys(groupedByDay).length - 1 ? "rounded-r-md" : ""
                } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
                } ${activeDay === day
                  ? "bg-[var(--background)] shadow-[var(--shadow-sm)] font-medium"
                  : "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50"
                } `}
            >
              <div className="flex flex-col items-center">
                <div className="mb-1">{day}</div>
                <div className="flex w-full">
                  {getPromisingHoursVisual(day)}
                </div>
              </div>
            </button>
          )
        ))}
      </div>

      {activeDay && (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-thin "
        >
          <table className="min-w-full text-sm text-center">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {groupedByDay[activeDay].map((hour, colIndex) => (
                  <th key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
                    {new Date(hour.time).toLocaleTimeString(["nb-NO"], {
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
