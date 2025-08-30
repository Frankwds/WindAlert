import { WeatherDataPoint } from '../openMeteo/types';

export interface WEATHER_FORECAST_72h extends WeatherDataPoint {
  landing_wind: number;
  landing_gust: number;
  landing_wind_direction: number;
  isPromising: boolean;
}
