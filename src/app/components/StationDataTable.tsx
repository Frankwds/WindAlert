'use client';

import { StationData } from "@/lib/supabase/types";
import WindDirectionArrow from "./WindDirectionArrow";
import { useState, useRef, useEffect } from "react";

interface StationDataTableProps {
  stationData: StationData[];
  timezone: string;
}

const StationDataTable: React.FC<StationDataTableProps> = ({
  stationData,
  timezone,
}) => {

  const [sortedStationData, setSortedStationData] = useState<StationData[]>(stationData);

  const getFirstDay = (data: StationData[]) => {
    if (data && data.length > 0) {
      const firstDay = new Date(data[0].updated_at).toLocaleDateString([], {
        weekday: 'short',
        timeZone: timezone,
      });
      return firstDay;
    }
    return null;
  }

  const [activeDay, setActiveDay] = useState<string | null>(getFirstDay(sortedStationData));
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  // Sort data by updated_at in descending order (most recent first)
  useEffect(() => {
    const sorted = [...stationData].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    setSortedStationData(sorted);
    setActiveDay(getFirstDay(sorted));
  }, [stationData]);

  // Scroll to center when active day changes
  useEffect(() => {
    if (activeDay && scrollContainerRef.current && activeDay !== getFirstDay(sortedStationData)) {
      const container = scrollContainerRef.current;
      const table = container.querySelector('table');
      if (table) {
        const scrollLeft = (table.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = scrollLeft;
      }
      return
    }
    if (activeDay && scrollContainerRef.current && activeDay === getFirstDay(sortedStationData)) {
      const container = scrollContainerRef.current;
      const table = container.querySelector('table');
      if (table) {
        container.scrollLeft = 0;
      }
    }
  }, [activeDay, getFirstDay]);

  const groupedByDay = sortedStationData.reduce((acc, data) => {
    const day = new Date(data.updated_at).toLocaleDateString([], {
      weekday: 'short',
      timeZone: timezone,
    });
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(data);
    return acc;
  }, {} as Record<string, StationData[]>);

  const dataRows = [
    {
      label: "Wind Speed",
      getValue: (data: StationData) => `${Math.round(data.wind_speed)}`,
    },
    {
      label: "Wind Gust",
      getValue: (data: StationData) => `${Math.round(data.wind_gust)}`,
    },
    {
      label: "Min Speed",
      getValue: (data: StationData) => `${Math.round(data.wind_min_speed)}`,
    },
    {
      label: "Direction",
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
      label: "Temperature",
      getValue: (data: StationData) => data.temperature ? `${Math.round(data.temperature)}°` : 'N/A',
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
              <div className="text-xs text-[var(--muted-foreground)]">
                {groupedByDay[day].length} readings
              </div>
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
            <thead>
              <tr className="border-b border-[var(--border)]">
                {groupedByDay[activeDay].map((data, colIndex) => (
                  <th key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
                    {new Date(data.updated_at).toLocaleTimeString(["nb-NO"], {
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
                  <td className="px-2 py-1 whitespace-nowrap bg-[var(--background)] text-left text-[var(--muted-foreground)] font-medium">
                    {row.label}
                  </td>
                  {groupedByDay[activeDay].map((data, colIndex) => (
                    <td key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)]">
                      <div className="w-12 flex items-center justify-center mx-auto">
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
