'use client';

import { StationData } from "@/lib/supabase/types";
import WindDirectionArrow from "./WindDirectionArrow";
import { useDataGrouping } from "@/lib/hooks/useDataGrouping";

interface StationDataTableProps {
  stationData: StationData[];
  timezone: string;
}

const StationDataTable: React.FC<StationDataTableProps> = ({
  stationData,
  timezone,
}) => {
  const {
    groupedByDay,
    activeDay,
    setActiveDay,
    scrollContainerRef,
  } = useDataGrouping({
    data: stationData,
    timezone,
    timeField: 'updated_at',
    sortOrder: 'desc', // Station data should be reverse chronological (most recent first)
  });


  const dataRows = [
    {

      getValue: (data: StationData) => new Date(data.updated_at).toLocaleTimeString(["nb-NO"], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
      }),
    },
    {
      getValue: (data: StationData) => data.temperature ? `${Math.round(data.temperature)}°` : 'N/A',
    },
    {
      getValue: (data: StationData) => `${Math.round(data.wind_speed)} (${Math.round(data.wind_gust)})`,
    },

    {

      getValue: (data: StationData) => (
        <WindDirectionArrow
          direction={data.direction}
          size={24}
          className="mx-auto"
          color="var(--foreground)"
        />
      ),
    },

  ];

  return (
    <div className="bg-[var(--background)] rounded-lg">
      <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
        {Object.keys(groupedByDay).map((day, index) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 py-1.5 px-3 transition-all cursor-pointer capitalize ${index === 0 ? "rounded-l-md" : ""
              } ${index === Object.keys(groupedByDay).length - 1 ? "rounded-r-md" : ""
              } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
              } ${activeDay === day
                ? "bg-[var(--background)] shadow-[var(--shadow-sm)] font-medium"
                : "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50"
              } `}
          >
            <div className="flex flex-col items-center">
              <div className="mb-1">{day}</div>

            </div>
          </button>
        ))}
      </div>

      {activeDay && (
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-thin transition-all duration-200"
        >
          <table className="min-w-full text-sm text-center">
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-[var(--border)] last:border-b-0`}
                >
                  {groupedByDay[activeDay].map((data, colIndex) => (
                    <td key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)]">
                      <div className={`w-12 flex items-center justify-center mx-auto ${rowIndex === 0 ? 'font-bold' : ''}`}>
                        {row.getValue(data)}
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
}

export default StationDataTable;
