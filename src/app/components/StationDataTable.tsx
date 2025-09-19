'use client';

import { StationData } from "@/lib/supabase/types";
import WindDirectionArrow from "./WindDirectionArrow";
import { useDataGrouping } from "@/lib/hooks/useDataGrouping";
import { getWindSpeedColor, getTemperatureOpacity } from "@/lib/utils/getValueColors";

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

      getValue: (data: StationData) => {
        const time = new Date(data.updated_at).toLocaleTimeString(["nb-NO"], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone,
        })
        return (
          <div className="flex flex-col items-center">
            <div className="text-xs text-[var(--muted)]">{time}</div>
          </div>
        )
      }
    },

    {
      getValue: (data: StationData) => {
        const windColor = getWindSpeedColor(data.wind_speed);
        const gustColor = getWindSpeedColor(data.wind_gust);
        return (
          <div className="relative rounded">
            <div className="flex flex-col items-center">
              <div className="relative rounded  w-11 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-t opacity-70"
                  style={{ backgroundColor: windColor }}
                />
                <span className="relative font-medium">{data.wind_speed}</span>
              </div>
              <hr />
              <div className="relative rounded w-11 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-b opacity-70"
                  style={{ backgroundColor: gustColor }}
                />
                <span className="relative font-semibold text-xs">({data.wind_gust})</span>
              </div>
            </div>
          </div>
        );
      },
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
    {
      getValue: (data: StationData) => {
        if (!data.temperature) return null;
        const temperature = Math.round(data.temperature);
        const opacity = temperature ? getTemperatureOpacity(temperature) : 0;

        return (
          <div className="relative rounded w-11 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded"
              style={{
                backgroundColor: temperature < 0 ? 'blue' : 'orange',
                opacity: opacity
              }}
            />
            <span className="relative font-medium">
              {`${temperature}°`}
            </span>
          </div>
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
                    <td key={colIndex} className=" py-1 whitespace-nowrap bg-[var(--background)]">
                      <div className={`flex pl-1 items-center justify-center  ${rowIndex === 0 ? 'font-bold' : ''}`}>
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
