'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import Image from "next/image";
import Collapsible from "../Collapsible";
import Hour from "./Hour";

interface DayProps {
  weekdayName: string;
  dailyForecast: ForecastCache1hr[];
  sixHourSymbols: string[];
  windDirections: string[];
  altitude: number;
  showValidation?: boolean;
}

const Day: React.FC<DayProps> = ({
  weekdayName,
  dailyForecast,
  sixHourSymbols,
  windDirections,
  altitude,
  showValidation = false,
}) => {
  // Determine if any hour in the day is promising
  const hasPromisingHours = showValidation && dailyForecast.some((hour) => hour.is_promising === true);

  return (
    <Collapsible
      title={
        <div className="flex items-center justify-between w-full px-4 py-3">
          <span className="font-bold text-lg text-[var(--foreground)]">
            {weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)}
          </span>
          {sixHourSymbols && (
            <div className="flex items-center space-x-2">
              {sixHourSymbols.map((symbol, index) => {
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
      className={`${showValidation && hasPromisingHours
        ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/50"
        : showValidation && !hasPromisingHours
          ? "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/50"
          : "bg-[var(--background)] border border-[var(--border)]"
        } rounded-lg transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]`}
    >
      <div className="p-2 space-y-1">
        {dailyForecast.map((hour) => (
          <Hour
            key={hour.time}
            hour={hour}
            windDirections={windDirections}
            altitude={altitude}
            showValidation={showValidation}
          />
        ))}
      </div>
    </Collapsible>
  );
};

export default Day;

