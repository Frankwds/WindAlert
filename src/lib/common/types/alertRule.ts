export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface AlertRule {
  id: number;
  locationId: string;
  alert_name: string;
  MIN_WIND_SPEED: number;
  MAX_WIND_SPEED: number;
  MAX_GUST: number;
  MAX_GUST_DIFFERENCE: number;
  MAX_PRECIPITATION: number;
  MAX_CAPE: number;
  MIN_LIFTED_INDEX: number;
  MAX_LIFTED_INDEX: number;
  MIN_CONVECTIVE_INHIBITION: number;
  MAX_CLOUD_COVER: number;
  MAX_WIND_SPEED_925hPa: number;
  MAX_WIND_SPEED_850hPa: number;
  MAX_WIND_SPEED_700hPa: number;
  MIN_CONSECUTIVE_HOURS: number;
}
