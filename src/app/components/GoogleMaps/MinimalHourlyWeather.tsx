'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "../WindDirectionArrow";

interface MinimalHourlyWeatherProps {
  weatherData: ForecastCache1hr[];
  timezone: string;
}

const MinimalHourlyWeather: React.FC<MinimalHourlyWeatherProps> = ({
  weatherData,
  timezone,
}) => {

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

  const dataRows = [
    {
      getValue: (hour: ForecastCache1hr) => {
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
      getValue: (hour: ForecastCache1hr) =>
        `${Math.round(hour.temperature)}°`,
    },
    {
      getValue: (hour: ForecastCache1hr) =>
        `${Math.round(hour.wind_speed)} (${Math.round(
          hour.wind_gusts
        )})`,
    },
    {
      getValue: (hour: ForecastCache1hr) => (
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
      <div className="overflow-x-auto overflow-y-hidden scrollbar-thin transition-all duration-200">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="border-b border-[var(--border)]">

              {weatherData.slice(0, 5).map((hour, colIndex) => (
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
                {weatherData.slice(0, 5).map((hour, colIndex) => (
                  <td key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)]">
                    <div className="w-12 flex items-center justify-center">
                      {row.getValue(hour)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MinimalHourlyWeather;
