export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface AlertRule {
  id: number;
  MIN_WIND_SPEED: number;
  MAX_WIND_SPEED: number;
  MAX_GUST: number;

  MUCH_WIND: number;
  MUCH_GUST: number;

  MAX_WIND_SPEED_925hPa: number;
  MAX_WIND_SPEED_850hPa: number;
  MAX_WIND_SPEED_700hPa: number;

  MAX_PRECIPITATION: number;

  MAX_CAPE: number;
  MIN_LIFTED_INDEX: number;
  MAX_LIFTED_INDEX: number;
  MIN_CONVECTIVE_INHIBITION: number;

}
