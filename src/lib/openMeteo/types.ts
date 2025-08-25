import { z } from 'zod';
import { openMeteoResponseSchema } from './zod';

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
  weatherCode: string;
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

export type FailureReason = {
  code: string;
  description: string;
};

export type WarningReason = {
  code: string;
  description: string;
};

export interface HourlyData {
  isGood: boolean;
  weatherData: WeatherDataPoint;
  failures?: FailureReason[];
  warnings?: WarningReason[];
}

export interface TimeInterval {
  start: string;
  end: string;
}

export interface DayResult {
  date: string;
  result: 'positive' | 'negative';
  hourlyData: HourlyData[];
  positiveIntervals: TimeInterval[];
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

export type OpenMeteoResponse = z.infer<typeof openMeteoResponseSchema>;
