const MIN_SELECTION_HOURS = 1;
const TODAY_INDEX = 0;
const DAY_END_HOUR = 24;
const DEFAULT_TODAY_WINDOW_HOURS = 6;
const DEFAULT_DAY_START_HOUR = 12;
const DEFAULT_DAY_END_HOUR = 18;

type DayIndex = 0 | 1 | 2 | 3;

type HourBounds = {
  min: number;
  max: number;
};

const clampHour = (hour: number) => Math.max(0, Math.min(DAY_END_HOUR, hour));

const isDayIndex = (value: number): value is DayIndex => value === 0 || value === 1 || value === 2 || value === 3;

export const getPromisingHourBoundsForDay = (selectedDay: number, now = new Date()): HourBounds => {
  if (!isDayIndex(selectedDay)) {
    return { min: 0, max: DAY_END_HOUR };
  }

  if (selectedDay === TODAY_INDEX) {
    return { min: now.getHours(), max: DAY_END_HOUR };
  }

  return { min: 0, max: DAY_END_HOUR };
};

const clampRangeToBounds = (range: [number, number], bounds: HourBounds): [number, number] => {
  let start = clampHour(Math.max(bounds.min, range[0]));
  let end = clampHour(Math.min(bounds.max, range[1]));

  if (end - start < MIN_SELECTION_HOURS) {
    if (bounds.max - bounds.min >= MIN_SELECTION_HOURS) {
      end = Math.min(bounds.max, start + MIN_SELECTION_HOURS);
      if (end - start < MIN_SELECTION_HOURS) {
        start = Math.max(bounds.min, end - MIN_SELECTION_HOURS);
      }
    } else {
      start = bounds.min;
      end = bounds.max;
    }
  }

  return [start, end];
};

export const getDefaultPromisingTimeRangeForDay = (selectedDay: number, now = new Date()): [number, number] => {
  const bounds = getPromisingHourBoundsForDay(selectedDay, now);

  if (selectedDay === TODAY_INDEX) {
    return clampRangeToBounds([bounds.min + 1, bounds.min + DEFAULT_TODAY_WINDOW_HOURS], bounds);
  }

  return clampRangeToBounds([DEFAULT_DAY_START_HOUR, DEFAULT_DAY_END_HOUR], bounds);
};

export const isPromisingFilterSelectionWithinBounds = (
  filter: { selectedDay: number; selectedTimeRange: [number, number] },
  now = new Date()
): boolean => {
  if (!isDayIndex(filter.selectedDay)) return false;
  const [start, end] = filter.selectedTimeRange;
  const bounds = getPromisingHourBoundsForDay(filter.selectedDay, now);
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start >= bounds.min &&
    end <= bounds.max &&
    end - start >= MIN_SELECTION_HOURS
  );
};
