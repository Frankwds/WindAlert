'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "./WindDirectionArrow";
import ExternalLinkIcon from "./ExternalLinkIcon";

interface HourlyWeatherProps {
  forecast: ForecastCache1hr[];
  lat: number;
  long: number;
}

const HourlyWeather: React.FC<HourlyWeatherProps> = ({
  forecast,
  lat,
  long,
}) => {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 border border-[var(--border)]">
        <div className="text-center py-8">
          <div className="text-[var(--foreground)] mb-4">
            Ingen time-for-time værdata tilgjengelig.
          </div>
        </div>
      </div>
    );
  }

  const hasLanding = forecast.some((hour) => hour.landing_wind !== null);

  const dataRows = [
    {
      getValue: (hour: ForecastCache1hr) => {
        const weatherIcon = getWeatherIcon(hour.weather_code);
        return weatherIcon ? (
          <Image
            src={weatherIcon.image}
            alt={weatherIcon.description}
            width={40}
            height={40}
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

  if (hasLanding) {
    dataRows.push(
      {
        getValue: (hour: ForecastCache1hr) => {
          if (hour.landing_wind === undefined || hour.landing_gust === undefined || hour.landing_wind_direction === undefined) {
            return <span className="text-[var(--muted)] opacity-50">-</span>;
          }

          return (
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm font-medium text-[var(--foreground)]">
                {Math.round(hour.landing_wind)} ({Math.round(hour.landing_gust)})
              </div>
              <WindDirectionArrow
                direction={hour.landing_wind_direction}
                size={18}
                className="mx-auto"
                color="var(--foreground)"
              />
            </div>
          );
        },
      }
    );
  }

  return (
    <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 border border-[var(--border)]">
      <div className="mb-4">
        <a
          href={`https://www.yr.no/nb/værvarsel/daglig-tabell/${lat.toFixed(3)},${long.toFixed(3)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-bold mb-2 text-[var(--foreground)] hover:text-[var(--accent)] hover:underline transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
        >
          Varsel fra Yr.no
          <ExternalLinkIcon size={24} className="inline-block" />
        </a>
      </div>
      <div className="overflow-x-auto overflow-y-hidden scrollbar-thin transition-all duration-200">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
                {/* Empty header for row labels */}
              </th>
              {forecast.map((hour, colIndex) => (
                <th key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
                  {new Date(hour.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    hour12: false,
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
                <td className="px-2 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)] text-left font-medium">
                  {(() => {
                    if (rowIndex === 0) return "Vær";
                    if (rowIndex === 1) return "Temp (°C)";
                    if (rowIndex === 2) return "Vind (m/s)";
                    if (rowIndex === 3) return "Retning";
                    if (hasLanding && rowIndex === 4) return "Landing (m/s)";
                    return "";
                  })()}
                </td>
                {forecast.map((hour, colIndex) => (
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

export default HourlyWeather;
