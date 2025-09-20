'use client';

import { ForecastCache1hr } from "@/lib/supabase/types";
import ExternalLinkIcon from "../ExternalLinkIcon";
import Day from "./Day";
import { ParaglidingLocation } from "@/lib/supabase/types";
import { locationToWindDirectionSymbols } from "@/lib/utils/getWindDirection";
import { useState } from "react";

interface WeatherTableProps {
  groupedByDay: Record<string, ForecastCache1hr[]>;
  sixHourSymbolsByDay: Record<string, string[]>;
  location: ParaglidingLocation;
  showValidation?: boolean;
}

const WeatherTable: React.FC<WeatherTableProps> = ({
  groupedByDay,
  sixHourSymbolsByDay,
  location,
  showValidation = false,
}) => {
  const { latitude, longitude, altitude } = location;
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const handleDayToggle = (dayName: string) => {
    if (expandedDay === dayName) {
      setExpandedDay(null);
    } else {
      setExpandedDay(dayName);
    }
  };

  const hasValidData = groupedByDay &&
    Object.keys(groupedByDay).length > 0 &&
    Object.values(groupedByDay).some(forecasts => forecasts && forecasts.length > 0);

  if (!hasValidData) {
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
    <div className="bg-[var(--background)] pb-4 rounded-lg shadow-[var(--shadow-lg)] p-1 sm:p-6 border border-[var(--border)]">

      <div className="mb-4">
        <a
          href={`https://www.yr.no/nb/værvarsel/daglig-tabell/${latitude.toFixed(3)},${longitude.toFixed(3)}`}
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
            windDirections={locationToWindDirectionSymbols(location)}
            altitude={altitude}
            showValidation={showValidation}
            isExpanded={expandedDay === weekdayName}
            onToggle={() => handleDayToggle(weekdayName)}
          />
        ))}
      </div>
    </div>
  );
};

export default WeatherTable;
