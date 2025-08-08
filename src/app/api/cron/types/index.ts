/**
 * Represents a single data point from the weather API response.
 * Field names are in camelCase, following standard TypeScript/JavaScript conventions.
 */
export interface WeatherDataPoint {
  /** The timestamp for the data point in ISO 8601 format. */
  time: string;

  /** Wind speed at 1000hPa pressure level. Unit: m/s */
  windSpeed1000hPa: number;

  /** Wind direction at 1000hPa pressure level. Unit: ° */
  windDirection1000hPa: number;

  /** Wind direction at 925hPa pressure level. Unit: ° */
  windDirection925hPa: number;

  /** Wind speed at 925hPa pressure level. Unit: m/s */
  windSpeed925hPa: number;

  /** Wind speed at 850hPa pressure level. Unit: m/s */
  windSpeed850hPa: number;

  /** Wind direction at 850hPa pressure level. Unit: ° */
  windDirection850hPa: number;

  /** Wind direction at 700hPa pressure level. Unit: ° */
  windDirection700hPa: number;

  /** Wind speed at 700hPa pressure level. Unit: m/s */
  windSpeed700hPa: number;

  /** Temperature at 1000hPa pressure level. Unit: °C */
  temperature1000hPa: number;

  /** Temperature at 925hPa pressure level. Unit: °C */
  temperature925hPa: number;

  /** Temperature at 850hPa pressure level. Unit: °C */
  temperature850hPa: number;

  /** Temperature at 700hPa pressure level. Unit: °C */
  temperature700hPa: number;

  /** Air temperature at 2 meters above ground. Unit: °C */
  temperature2m: number;

  /** Total precipitation (rain, showers, snow). Unit: mm */
  precipitation: number;

  /** Probability of precipitation. Unit: % */
  precipitationProbability: number;

  /** Total cloud cover. Unit: % */
  cloudCover: number;

  /** Wind speed at 10 meters above ground. Unit: m/s */
  windSpeed10m: number;

  /** Wind direction at 10 meters above ground. Unit: ° */
  windDirection10m: number;

  /** Wind gusts at 10 meters above ground. Unit: m/s */
  windGusts10m: number;

  /** Weather phenomena reported from a weather station. See WMO Code table. */
  weatherCode: number;

  /** Sea level pressure. Unit: hPa */
  pressureMsl: number;

  /** Convective Inhibition (CIN). Unit: J/kg */
  convectiveInhibition: number;

  /** Low, medium, and high level cloud cover. Unit: % */
  cloudCoverLow: number;
  cloudCoverMid: number;
  cloudCoverHigh: number;

  /** A flag indicating if it is daytime (1) or nighttime (0). */
  isDay: 0 | 1;

  /** Altitude of the 0°C isotherm. Unit: m */
  freezingLevelHeight: number;

  /** Convective Available Potential Energy (CAPE). Unit: J/kg */
  cape: number;

  /** Lifted Index. Unit: K */
  liftedIndex: number;

  /** Atmospheric boundary layer height. Unit: m */
  boundaryLayerHeight: number;
}

export interface HourlyData {
  isGood: boolean;
  weatherData: WeatherDataPoint;
}

export interface DayResult {
  date: string;
  result: 'positive' | 'negative';
  hourlyData: HourlyData[];
}

export interface LocationResult {
  alert_name: string;
  locationName: string;
  result: 'positive' | 'negative' | 'error';
  dailyData: DayResult[];
  lat: number;
  long: number;
  elevation: number;
}

export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface AlertRule {
  alert_name: string;
  locationName: string;
  lat: number;
  long: number;
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
  WIND_DIRECTIONS: WindDirection[];
  WMO_CODE_MAX: number;
}