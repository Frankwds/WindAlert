'use client';

import { WeatherDataPointYr1h } from "@/lib/yr/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "./WindDirectionArrow";
import ExternalLinkIcon from "./ExternalLinkIcon";
import { useEffect, useState, useRef } from "react";
import { fetchYrData } from "@/lib/yr/apiClient";
import { mapYrData } from "@/lib/yr/mapping";
import { LoadingSpinner } from "./shared/LoadingSpinner";

interface HourlyWeatherProps {
  takeoffLat: number;
  takeoffLong: number;
  landing?: {
    lat: number;
    long: number;
  };
  timezone: string;
}

const HourlyWeather: React.FC<HourlyWeatherProps> = ({
  takeoffLat,
  takeoffLong,
  landing,
  timezone,
}) => {
  const [takeoffWeatherData, setTakeoffWeatherData] = useState<WeatherDataPointYr1h[]>([]);
  const [landingWeatherData, setLandingWeatherData] = useState<WeatherDataPointYr1h[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alignmentPerformed = useRef(false);

  const hasLanding = !!landing;

  useEffect(() => {
    if (!hasLanding || !landingWeatherData.length || !takeoffWeatherData.length || alignmentPerformed.current) {
      return;
    }
    const takeoffFirstTime = new Date(takeoffWeatherData[0].time).getTime();
    const landingFirstTime = new Date(landingWeatherData[0].time).getTime();
    const timeDiff = Math.abs(takeoffFirstTime - landingFirstTime);

    // If more than 30 minutes out of sync, remove first index from whichever array is ahead
    if (timeDiff > 30 * 60 * 1000) {
      if (landingFirstTime > takeoffFirstTime) {
        // Landing is ahead, remove first landing data point
        setLandingWeatherData(prev => prev.slice(1));
      } else {
        // Takeoff is ahead, remove first takeoff data point
        setTakeoffWeatherData(prev => prev.slice(1));
      }
    }
    alignmentPerformed.current = true;
  }, [takeoffWeatherData, landingWeatherData, hasLanding]);


  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch takeoff weather data
        const takeoffData = await fetchYrData(takeoffLat, takeoffLong);
        const mappedTakeoffData = mapYrData(takeoffData);
        setTakeoffWeatherData(mappedTakeoffData.weatherDataYr1h);

        // Fetch landing weather data if coordinates are provided
        if (hasLanding) {
          const landingData = await fetchYrData(landing!.lat, landing!.long);
          const mappedLandingData = mapYrData(landingData);
          setLandingWeatherData(mappedLandingData.weatherDataYr1h);
        }
      } catch (error) {
        console.error('Failed to fetch weather data:', error);
        setError('Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [takeoffLat, takeoffLong, landing, hasLanding]);

  if (loading) {
    return (
      <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 border border-[var(--border)]">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" text="Loading weather data..." />
        </div>
      </div>
    );
  }

  if (error || !takeoffWeatherData || takeoffWeatherData.length === 0) {
    return (
      <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 border border-[var(--border)]">
        <div className="text-center py-8">
          <div className="text-[var(--foreground)] text-red-500 mb-4">
            {error || 'No hourly weather data available.'}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              // Trigger a re-fetch by updating the state
              setTakeoffWeatherData([]);
              setLandingWeatherData([]);
            }}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const dataRows = [
    {
      getValue: (hour: WeatherDataPointYr1h) => {
        const weatherIcon = getWeatherIcon(hour.symbol_code);
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
      getValue: (hour: WeatherDataPointYr1h) =>
        `${Math.round(hour.air_temperature)}°`,
    },
    {
      getValue: (hour: WeatherDataPointYr1h) =>
        `${Math.round(hour.wind_speed)} (${Math.round(
          hour.wind_speed_of_gust
        )})`,
    },
    {
      getValue: (hour: WeatherDataPointYr1h) => (
        <WindDirectionArrow
          direction={hour.wind_from_direction}
          size={24}
          className="mx-auto"
          color="var(--foreground)"
        />
      ),
    },
  ];

  // Add landing wind data row if aligned data is available
  if (landingWeatherData) {
    dataRows.push(
      {
        getValue: (hour: WeatherDataPointYr1h) => {
          // Since arrays are aligned, we can find the landing hour by matching time
          const landingHour = landingWeatherData.find(lh => lh.time === hour.time);
          if (!landingHour) return <span className="text-[var(--muted)] opacity-50">-</span>;

          return (
            <div className="flex flex-col items-center gap-1">
              <div className="text-sm font-medium text-[var(--foreground)]">
                {Math.round(landingHour.wind_speed)} ({Math.round(landingHour.wind_speed_of_gust)})
              </div>
              <WindDirectionArrow
                direction={landingHour.wind_from_direction}
                size={18}
                className="mx-auto"
                color="var(--foreground)"
              />
              {/* <div className="text-xs text-[var(--muted)]">
                {new Date(landingHour.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: timezone,
                })}
              </div> */}
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
          href={`https://www.yr.no/en/forecast/daily-table/${takeoffLat.toFixed(3)},${takeoffLong.toFixed(3)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-bold mb-2 text-[var(--foreground)] hover:text-[var(--accent)] hover:underline transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
        >
          Forecast from Yr.no
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
              {takeoffWeatherData.map((hour, colIndex) => (
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
                <td className="px-2 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)] text-left font-medium">
                  {(() => {
                    if (rowIndex === 0) return "Weather";
                    if (rowIndex === 1) return "Temp (°C)";
                    if (rowIndex === 2) return "Wind (m/s)";
                    if (rowIndex === 3) return "Direction";
                    if (landingWeatherData && rowIndex === 4) return "Landing (m/s)";
                    return "";
                  })()}
                </td>
                {takeoffWeatherData.map((hour, colIndex) => (
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
