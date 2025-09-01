import { AlertRule } from '@/lib/common/types/alertRule';


export const DEFAULT_ALERT_RULE: AlertRule = {
  id: 1,
  alert_name: 'Default Rule',
  locationId: 'nope',
  MIN_WIND_SPEED: 0,
  MAX_WIND_SPEED: 8,
  MAX_GUST: 14.0,
  MAX_GUST_DIFFERENCE: 0,
  MAX_PRECIPITATION: 0,
  MAX_CAPE: 10000,
  MIN_LIFTED_INDEX: -6,
  MAX_LIFTED_INDEX: 100,
  MIN_CONVECTIVE_INHIBITION: -5000,
  MAX_CLOUD_COVER: 100,
  MAX_WIND_SPEED_925hPa: 15, // 925hPa is approximately 800m altitude
  MAX_WIND_SPEED_850hPa: 20, // 850hPa is approximately 1500m altitude
  MAX_WIND_SPEED_700hPa: 25, // 700hPa is approximately 3000m altitude
  MIN_CONSECUTIVE_HOURS: 3,
};
