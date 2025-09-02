'use client';

import { ForecastCache1hr, MinimalForecast } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "./WindDirectionArrow";
import ExternalLinkIcon from "./ExternalLinkIcon";
import Collapsible from "./Collapsible";

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

  const groupedByDay = forecast.reduce((acc, hour) => {
    const day = new Date(hour.time).toLocaleDateString([], {
      weekday: 'long',
    });
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
            defaultOpen={index === 0}
            title={
              <div className="flex items-center justify-between w-full px-4 py-3">
                <span className="font-bold text-lg text-[var(--foreground)]">{date.charAt(0).toUpperCase() + date.slice(1)}</span>
              </div>
            }
            className="bg-[var(--background)] border border-[var(--border)] rounded-lg transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]"
          >
            <div className="overflow-x-auto scrollbar-thin">
              <div className="flex p-4 space-x-4">
                {dailyForecast.map((hour) => {
                  const weatherIcon = getWeatherIcon(hour.weather_code);
                  return (
                    <div
                      key={hour.time}
                      className="flex-shrink-0 w-32 text-center p-4 rounded-lg bg-opacity-20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-[var(--shadow-xl)] cursor-pointer border border-transparent hover:border-[var(--accent)]"
                      style={{
                        background: 'rgba(var(--muted-rgb), 0.1)',
                      }}
                    >
                      <div className="font-bold text-lg text-[var(--foreground)]">
                        {new Date(hour.time).getHours()}:00
                      </div>
                      {weatherIcon && (
                        <div className="my-3 flex justify-center">
                          <Image
                            src={weatherIcon.image}
                            alt={weatherIcon.description}
                            width={60}
                            height={60}
                          />
                        </div>
                      )}
                      <div className="text-2xl font-semibold text-[var(--foreground)]">{Math.round(hour.temperature)}°C</div>
                      <div className="flex items-center justify-center space-x-2 mt-3 text-[var(--foreground)]">
                        <WindDirectionArrow direction={hour.wind_direction} size={18} color="var(--accent)" />
                        <span className="font-semibold">{Math.round(hour.wind_speed)}</span>
                        <span className="text-sm text-[var(--muted)]">({Math.round(hour.wind_gusts)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};

export default HourlyWeather;
