import { z } from 'zod';
import { openMeteoResponseSchema } from '../lib/openmeteo-validation';

export interface WeatherDataPoint {
  time: string;
  windSpeed1000hPa: number;
  windDirection1000hPa: number;
  windDirection925hPa: number;
  windSpeed925hPa: number;
  windSpeed850hPa: number;
  windDirection850hPa: number;
  windDirection700hPa: number;
  windSpeed700hPa: number;
  temperature1000hPa: number;
  temperature925hPa: number;
  temperature850hPa: number;
  temperature700hPa: number;
  temperature2m: number;
  precipitation: number;
  precipitationProbability: number;
  cloudCover: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
  weatherCode: number;
  pressureMsl: number;
  convectiveInhibition: number;
  cloudCoverLow: number;
  cloudCoverMid: number;
  cloudCoverHigh: number;
  isDay: 0 | 1;
  freezingLevelHeight: number;
  cape: number;
  liftedIndex: number;
  boundaryLayerHeight: number;
  geopotentialHeight1000hPa: number;
  geopotentialHeight925hPa: number;
  geopotentialHeight850hPa: number;
  geopotentialHeight700hPa: number;
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

export type OpenMeteoResponse = z.infer<typeof openMeteoResponseSchema>;