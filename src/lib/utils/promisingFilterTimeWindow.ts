const MIN_SELECTION_HOURS = 1;
const TODAY_INDEX = 0;
const DAY_AFTER_TOMORROW_INDEX = 2;
const DAY_END_HOUR = 24;
const DEFAULT_TODAY_WINDOW_HOURS = 6;
const DEFAULT_SHORT_WINDOW_HOURS = 3;
const DEFAULT_DAY_START_HOUR = 12;
const DEFAULT_DAY_END_HOUR = 18;

type DayIndex = 0 | 1 | 2;

type HourBounds = {
  min: number;
  max: number;
};

const clampHour = (hour: number) => Math.max(0, Math.min(DAY_END_HOUR, hour));

const roundUpToHour = (date: Date) => {
  const rounded = new Date(date);
  if (rounded.getMinutes() > 0 || rounded.getSeconds() > 0 || rounded.getMilliseconds() > 0) {
    rounded.setHours(rounded.getHours() + 1);
  }
  rounded.setMinutes(0, 0, 0);
  return rounded;
};

const getDayAfterTomorrowMaxHour = (now: Date): number => {
  const roundedLimit = roundUpToHour(new Date(now.getTime() + 48 * 60 * 60 * 1000));
  const rawHour = roundedLimit.getHours();
  // Keep the third day selectable even exactly at midnight.
  return Math.max(MIN_SELECTION_HOURS, clampHour(rawHour));
};

const isDayIndex = (value: number): value is DayIndex => value === 0 || value === 1 || value === 2;

export const getPromisingHourBoundsForDay = (selectedDay: number, now = new Date()): HourBounds => {
  if (!isDayIndex(selectedDay)) {
    return { min: 0, max: DAY_END_HOUR };
  }

  if (selectedDay === TODAY_INDEX) {
    return { min: now.getHours(), max: DAY_END_HOUR };
  }

  if (selectedDay === DAY_AFTER_TOMORROW_INDEX) {
    return { min: 0, max: getDayAfterTomorrowMaxHour(now) };
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

  if (selectedDay === DAY_AFTER_TOMORROW_INDEX && bounds.max < DEFAULT_DAY_END_HOUR) {
    return clampRangeToBounds([bounds.max - DEFAULT_SHORT_WINDOW_HOURS, bounds.max], bounds);
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
