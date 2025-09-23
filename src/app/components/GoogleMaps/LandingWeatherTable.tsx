'use client';

import { MinimalForecast } from "@/lib/supabase/types";
import WindDirectionArrow from "@/app/components/shared/WindDirectionArrow";
import { useDataGrouping } from "@/lib/hooks/useDataGrouping";
import { useMemo } from "react";

interface LandingWeatherTableProps {
  forecast: MinimalForecast[];
  timezone: string;
}

const LandingWeatherTable: React.FC<LandingWeatherTableProps> = ({
  forecast,
  timezone,
}) => {
  const hasLandingWind = forecast.some((f) => f.landing_wind !== null && f.landing_wind !== undefined && f.landing_wind !== 0);
  if (!hasLandingWind) {
    return (
      <div className="bg-[var(--background)] rounded-lg">
        <div className="text-center py-8">
          <div className="text-[var(--foreground)] mb-4">
            Ingen værmelding tilgjengelig enda.
          </div>
        </div>
      </div>
    );
  }
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


  const dataRows = [
    {
      getValue: (hour: MinimalForecast) => {
        if (hour.landing_wind === undefined || hour.landing_gust === undefined) {
          return '?';
        }
        return `${Math.round(hour.landing_wind)} (${Math.round(hour.landing_gust)})`;
      },
    },
    {
      getValue: (hour: MinimalForecast) => {
        if (hour.landing_wind_direction === undefined) {
          return '?';
        }
        return (
          <WindDirectionArrow
            direction={hour.landing_wind_direction}
            size={24}
            className="mx-auto"
            color="var(--foreground)"
          />
        );
      },
    },
  ];

  return (
    <div className="bg-[var(--background)] rounded-lg">
      <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
        {Object.keys(groupedByDay).map((day, index) => (
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
              <div>{day}</div>
            </div>
          </button>
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

export default LandingWeatherTable;
