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
