'use client';

import { ForecastCache1hr, MinimalForecast } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "./WindDirectionArrow";
import ExternalLinkIcon from "./ExternalLinkIcon";
import Collapsible from "./Collapsible";
import { useState } from "react";

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
  const [openDay, setOpenDay] = useState<string | null>(null);

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

  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const groupedByDay = forecast.reduce((acc, hour) => {
    const dayIndex = new Date(hour.time).getDay();
    const day = dayNames[dayIndex];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(hour);
    return acc;
  }, {} as Record<string, ForecastCache1hr[]>);


  return (
    <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 sm:p-6 border border-[var(--border)]">
      <div className="mb-4">
        <a
          href={`https://www.yr.no/nb/værvarsel/daglig-tabell/${lat.toFixed(3)},${long.toFixed(3)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xl font-bold mb-2 text-[var(--foreground)] hover:text-[var(--accent)] hover:underline transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
        >
          Yr.no
          <ExternalLinkIcon size={24} className="inline-block" />
        </a>
      </div>
      <div className="space-y-4">
        {Object.entries(groupedByDay).map(([date, dailyForecast], index) => (
          <Collapsible
            key={date}
            isOpen={openDay === date}
            onToggle={() => setOpenDay(openDay === date ? null : date)}
            title={
              <div className="flex items-center justify-between w-full px-4 py-3">
                <span className="font-bold text-lg text-[var(--foreground)]">{date.charAt(0).toUpperCase() + date.slice(1)}</span>
              </div>
            }
            className="bg-[var(--background)] border border-[var(--border)] rounded-lg transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]"
          >
            <div className="p-2 space-y-1">
              {dailyForecast.map((hour) => {
                const weatherIcon = getWeatherIcon(hour.weather_code);
                return (
                  <div
                    key={hour.time}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-opacity-20 transition-all duration-200 ease-in-out hover:shadow-[var(--shadow-md)] cursor-pointer border border-transparent hover:border-[var(--accent)]"
                    style={{
                      background: 'rgba(var(--muted-rgb), 0.1)',
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-sm text-[var(--foreground)] w-12">
                        {new Date(hour.time).getHours().toString().padStart(2, '0')}
                      </div>
                      {weatherIcon && (
                        <div className="flex justify-center">
                          <Image
                            src={weatherIcon.image}
                            alt={weatherIcon.description}
                            width={28}
                            height={28}
                          />
                        </div>
                      )}
                      <div className="text-lg font-semibold text-[var(--foreground)]">{Math.round(hour.temperature)}°C</div>
                      <div className="text-xs text-blue-500">
                        {hour.precipitation_min !== 0
                          ? `${hour.precipitation_min}-${hour.precipitation_max} mm`
                          : ''
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-[var(--foreground)]">
                      <WindDirectionArrow direction={hour.wind_direction} size={14} />
                      <span className="font-semibold text-sm">{Math.round(hour.wind_speed)}</span>
                      <span className="text-xs text-[var(--muted)]">({Math.round(hour.wind_gusts)})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default HourlyWeather;
