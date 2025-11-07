import { useState, useEffect, useRef, useCallback } from 'react';
import { MinimalForecast, StationData } from '@/lib/supabase/types';

type DataWithTime = MinimalForecast | StationData;

interface UseDataGroupingProps<T extends DataWithTime> {
  data: T[];
  timezone: string;
  timeField: keyof T;
  sortOrder?: 'asc' | 'desc';
}

interface UseDataGroupingReturn<T extends DataWithTime> {
  sortedData: T[];
  groupedByDay: Record<string, T[]>;
  activeDay: string | null;
  setActiveDay: (day: string) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  getFirstDayFromSorted: (data: T[]) => string | null;
}

export function useDataGrouping<T extends DataWithTime>({
  data,
  timezone,
  timeField,
  sortOrder = 'desc',
}: UseDataGroupingProps<T>): UseDataGroupingReturn<T> {
  const [sortedData, setSortedData] = useState<T[]>(data);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getFirstDayFromSorted = useCallback(
    (data: T[]) => {
      if (data && data.length > 0) {
        const timeValue = data[0][timeField] as string;
        const firstDay = new Date(timeValue).toLocaleDateString([], {
          weekday: 'short',
          timeZone: timezone,
        });
        return firstDay;
      }
      return null;
    },
    [timeField, timezone]
  );

  // Sort data based on time field
  useEffect(() => {
    const sorted = [...data].sort((a, b) => {
      const timeA = new Date(a[timeField] as string).getTime();
      const timeB = new Date(b[timeField] as string).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
    setSortedData(sorted);
    setActiveDay(getFirstDayFromSorted(sorted));
  }, [data, timeField, sortOrder, getFirstDayFromSorted]);

  // Scroll to center when active day changes
  useEffect(() => {
    if (activeDay && scrollContainerRef.current && activeDay !== getFirstDayFromSorted(sortedData)) {
      const container = scrollContainerRef.current;
      const table = container.querySelector('table');
      if (table) {
        const scrollLeft = (table.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = scrollLeft;
      }
      return;
    }
    if (activeDay && scrollContainerRef.current && activeDay === getFirstDayFromSorted(sortedData)) {
      const container = scrollContainerRef.current;
      const table = container.querySelector('table');
      if (table) {
        container.scrollLeft = 0;
      }
    }
  }, [activeDay, sortedData, getFirstDayFromSorted]);

  // Group data by day
  const groupedByDay = sortedData.reduce(
    (acc, item) => {
      const timeValue = item[timeField] as string;
      const day = new Date(timeValue).toLocaleDateString([], {
        weekday: 'short',
        timeZone: timezone,
      });
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );

  return {
    sortedData,
    groupedByDay,
    activeDay,
    setActiveDay,
    scrollContainerRef,
    getFirstDayFromSorted,
  };
}
