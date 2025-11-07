import { z } from 'zod';
import { openMeteoResponseSchema } from './zod';
import { ForecastCache1hr } from '../supabase/types';

export interface WeatherDataPoint {
  // Basic identification
  time: string;

  // Surface conditions
  temperature2m: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
  precipitation: number;
  precipitationProbability: number;
  pressureMsl: number;
  weatherCode: string;
  isDay: 0 | 1;

  // Atmospheric conditions - Wind at different pressure levels
  windSpeed1000hPa: number;
  windDirection1000hPa: number;
  windSpeed925hPa: number;
  windDirection925hPa: number;
  windSpeed850hPa: number;
  windDirection850hPa: number;
  windSpeed700hPa: number;
  windDirection700hPa: number;

  // Atmospheric conditions - Temperature at different pressure levels
  temperature1000hPa: number;
  temperature925hPa: number;
  temperature850hPa: number;
  temperature700hPa: number;

  // Atmospheric conditions - Cloud cover
  cloudCover: number;
  cloudCoverLow: number;
  cloudCoverMid: number;
  cloudCoverHigh: number;

  // Atmospheric conditions - Stability and convection
  cape: number;
  convectiveInhibition: number;
  liftedIndex: number;
  boundaryLayerHeight: number;
  freezingLevelHeight: number;

  // Atmospheric conditions - Geopotential heights
  geopotentialHeight1000hPa: number;
  geopotentialHeight925hPa: number;
  geopotentialHeight850hPa: number;
  geopotentialHeight700hPa: number;
}

export interface HourlyData {
  isGood: boolean;
  weatherData: ForecastCache1hr;
  failures?: string;
  warnings?: string;
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
