'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import ExternalLinkIcon from "../ExternalLinkIcon";
import Day from "./Day";

interface WeatherTableProps {
  groupedByDay: Record<string, ForecastCache1hr[]>;
  sixHourSymbolsByDay: Record<string, string[]>;
  lat: number;
  long: number;
  windDirections?: string[];
  altitude: number;
}

const WeatherTable: React.FC<WeatherTableProps> = ({
  groupedByDay,
  sixHourSymbolsByDay,
  lat,
  long,
  windDirections = [],
  altitude,
}) => {

  if (!groupedByDay || groupedByDay[Object.keys(groupedByDay)[0]].length === 0) {
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
        {Object.entries(groupedByDay).map(([weekdayName, dailyForecast]) => (
          <Day
            key={weekdayName}
            weekdayName={weekdayName}
            dailyForecast={dailyForecast}
            sixHourSymbols={sixHourSymbolsByDay[weekdayName] || []}
            windDirections={windDirections}
            altitude={altitude}
          />
        ))}
      </div>
    </div>
  );
};

export default WeatherTable;
