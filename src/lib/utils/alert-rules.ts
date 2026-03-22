import { AlertRule } from '@/lib/common/types/alertRule';

export const DEFAULT_ALERT_RULE: AlertRule = {
  id: 1,

  MIN_WIND_SPEED: 0,
  MAX_WIND_SPEED: 7.5,
  MAX_GUST: 11.5,

  MUCH_GUST: 9.5,
  MUCH_WIND: 5.5,

  MAX_WIND_SPEED_925hPa: 11.5, // 925hPa is approximately 800m altitude
  MAX_WIND_SPEED_850hPa: 12.5, // 850hPa is approximately 1500m altitude
  MAX_WIND_SPEED_700hPa: 13.5, // 700hPa is approximately 3000m altitude

  MAX_PRECIPITATION: 0,

  MAX_CAPE: -1,
  MIN_LIFTED_INDEX: -1,
  MAX_LIFTED_INDEX: -1,
  MIN_CONVECTIVE_INHIBITION: -1,
};

/** Upper bound for promising-filter wind range slider (m/s). */
export const PROMISING_WIND_SLIDER_MAX = 15;

/** Gusts are not considered for the map promising filter (see `createPromisingFilterAlertRule`). */
const PROMISING_FILTER_SKIP_GUST_CHECKS = Number.MAX_SAFE_INTEGER;

export const DEFAULT_PROMISING_WIND_RANGE: [number, number] = [
  DEFAULT_ALERT_RULE.MIN_WIND_SPEED,
  DEFAULT_ALERT_RULE.MAX_WIND_SPEED,
];

/** Disable much_wind combo failures when validating only promising-filter wind band. */
const PROMISING_FILTER_MUCH_DISABLED = 999;

export function clampPromisingFilterWindRange(range: [number, number]): [number, number] {
  let [a, b] = range;
  a = Math.min(Math.max(a, 0), PROMISING_WIND_SLIDER_MAX);
  b = Math.min(Math.max(b, 0), PROMISING_WIND_SLIDER_MAX);
  if (a > b) [a, b] = [b, a];
  return [a, b];
}

export function createPromisingFilterAlertRule(windMin: number, windMax: number): AlertRule {
  const [lo, hi] = clampPromisingFilterWindRange([windMin, windMax]);
  return {
    ...DEFAULT_ALERT_RULE,
    MIN_WIND_SPEED: lo,
    MAX_WIND_SPEED: hi,
    MAX_GUST: PROMISING_FILTER_SKIP_GUST_CHECKS,
    MUCH_WIND: PROMISING_FILTER_MUCH_DISABLED,
    MUCH_GUST: PROMISING_FILTER_MUCH_DISABLED,
  };
}
