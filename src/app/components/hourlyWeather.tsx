'use client';

import { ForecastCache1hr, MinimalForecast } from "@/lib/supabase/types";
import { WeatherDataPointYr1h, WeatherDataPointYr6h, WeatherDataYr } from "@/lib/yr/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import WindDirectionArrow from "./WindDirectionArrow";
import ExternalLinkIcon from "./ExternalLinkIcon";
import Collapsible from "./Collapsible";
import HourlyWeatherDetails from "./HourlyWeatherDetails";
import { useState } from "react";

interface HourlyWeatherProps {
  forecast: ForecastCache1hr[];
  yrdata: WeatherDataYr;
  lat: number;
  long: number;
  windDirections?: string[];
  altitude: number;
}

const HourlyWeather: React.FC<HourlyWeatherProps> = ({
  forecast,
  yrdata,
  lat,
  long,
  windDirections = [],
  altitude,
}) => {
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [expandedHour, setExpandedHour] = useState<string | null>(null);

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

  // Create six-hourly symbols from hourly forecast (every 6th hour's next_6_hours_symbol_code)
  const sixHourSymbolsByDay = getSixHourSymbolsByDay(yrdata, dayNames);

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
        {Object.entries(groupedByDay).map(([weekdayName, dailyForecast], index) => (
          <Collapsible
            key={weekdayName}
            isOpen={openDay === weekdayName}
            onToggle={() => setOpenDay(openDay === weekdayName ? null : weekdayName)}
            title={
              <div className="flex items-center justify-between w-full px-4 py-3">
                <span className="font-bold text-lg text-[var(--foreground)]">{weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)}</span>
                {sixHourSymbolsByDay[weekdayName] && (
                  <div className="flex items-center space-x-2">
                    {sixHourSymbolsByDay[weekdayName].map((symbol, index) => {
                      const weatherIcon = getWeatherIcon(symbol);
                      return weatherIcon ? (
                        <Image
                          key={index}
                          src={weatherIcon.image}
                          alt={weatherIcon.description}
                          width={32}
                          height={32}
                          className="opacity-80"
                        />
                      ) : (
                        <div key={index} className="w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center rounded">
                          {symbol}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            }
            className="bg-[var(--background)] border border-[var(--border)] rounded-lg transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]"
          >
            <div className="p-2 space-y-1">
              {dailyForecast.map((hour) => {
                const weatherIcon = getWeatherIcon(hour.weather_code);
                const isExpanded = expandedHour === hour.time;
                return (
                  <div key={hour.time} className="space-y-1">
                    <div
                      onClick={() => setExpandedHour(isExpanded ? null : hour.time)}
                      className="grid grid-cols-6 gap-4 items-center px-3 py-2 rounded-md bg-opacity-20 transition-all duration-200 ease-in-out hover:shadow-[var(--shadow-md)] cursor-pointer border border-transparent hover:border-[var(--accent)]"
                      style={{
                        background: 'rgba(var(--muted-rgb), 0.1)',
                      }}
                    >
                      {/* Time column */}
                      <div className="font-semibold text-sm text-[var(--foreground)] text-center">
                        {new Date(hour.time).getHours().toString().padStart(2, '0')}
                      </div>

                      {/* Weather icon column */}
                      <div className="flex justify-center">
                        {weatherIcon && (
                          <Image
                            src={weatherIcon.image}
                            alt={weatherIcon.description}
                            width={32}
                            height={32}
                          />
                        )}
                      </div>

                      {/* Temperature column */}
                      <div
                        className={`text-lg font-semibold text-center ${Math.round(hour.temperature) <= 0 ? 'text-[var(--accent)]/70' : 'text-[var(--error)]/70'}`}
                      >
                        {Math.round(hour.temperature)}°C
                      </div>

                      {/* Precipitation column */}
                      <div className="text-xs text-blue-500 text-center">
                        {hour.precipitation_max !== 0
                          ? `${hour.precipitation_min} - ${hour.precipitation_max}`
                          : ''
                        }
                      </div>

                      {/* Wind direction column */}
                      <div className="flex justify-center">
                        <WindDirectionArrow direction={hour.wind_direction} />
                      </div>

                      {/* Wind speed column */}
                      <div className="text-center text-[var(--foreground)]">
                        <span className="font-semibold text-sm">{Math.round(hour.wind_speed)}</span>
                        <span className="text-xs text-[var(--muted)] ml-1">({Math.round(hour.wind_gusts)})</span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 py-4 bg-[var(--background)] border border-[var(--border)] rounded-md shadow-[var(--shadow-sm)]">
                        <HourlyWeatherDetails hour={hour} windDirections={windDirections} altitude={altitude} />
                      </div>
                    )}
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

function getSixHourSymbolsByDay(yrdata: WeatherDataYr, dayNames: string[]) {
  const sixHourSymbolsByDay: Record<string, string[]> = {};

  const yrdataGroupedByDay = yrdata.weatherDataYrHourly.reduce((acc, hour) => {
    const dayIndex = new Date(hour.time).getDay();
    const day = dayNames[dayIndex];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(hour);
    return acc;
  }, {} as Record<string, WeatherDataPointYr1h[]>);

  Object.entries(yrdataGroupedByDay)
    .forEach(([day, hours]) => {
      if (!sixHourSymbolsByDay[day]) {
        sixHourSymbolsByDay[day] = [];
      }
      hours
        .forEach((hour, index) => {
          if (index === 0) {
            sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
            return;
          }
          if (index === hours.length - 1 && hours.length > 6 && sixHourSymbolsByDay[day].length < 4) {
            sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
            return;
          }
          if (index % 6 === 0) {
            sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
            return;
          }
        })
    });

  yrdata.weatherDataYrSixHourly.slice(0, 6)
    .forEach((hour) => {
      const dayIndex = new Date(hour.time).getDay();
      const day = dayNames[dayIndex];
      if (!sixHourSymbolsByDay[day]) {
        sixHourSymbolsByDay[day] = [];
      }
      if (hour.symbol_code) {
        sixHourSymbolsByDay[day].push(hour.symbol_code);
      }
    });

  return sixHourSymbolsByDay;
}


export default HourlyWeather;
