/** Today plus three more calendar days (matches PromisingFilter day indices 0–3). */
export const FORECAST_RANGE_DAY_COUNT = 4;

/**
 * Exclusive end of the app forecast range: midnight at the start of the
 * calendar day after the last included day (all hours through day index 3).
 */
export function getForecastRangeEnd(now = new Date()): Date {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + FORECAST_RANGE_DAY_COUNT);
  return end;
}
