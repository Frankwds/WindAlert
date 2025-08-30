import { WeatherDataPointYr1h } from '../yr/types';

export interface User {
  id: string;
  email: string;
  name: string | null;
  google_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParaglidingLocation {
  id: string;
  name: string;
  description: string | null;
  longitude: number;
  latitude: number;
  altitude: number;
  landing_latitude?: number;
  landing_longitude?: number;
  landing_altitude?: number;
  country: string;
  flightlog_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
}

export interface WeatherStation {
  id: string;
  station_id: string;
  name: string;
  longitude: number;
  latitude: number;
  altitude: number;
  country: string | null;
  region: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParaglidingMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  weatherData?: WeatherDataPointYr1h[];
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
}

export interface ParaglidingLocationForCache {
  id: string;
  latitude: number;
  longitude: number;
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
  landing_latitude: number;
  landing_longitude: number;
  landing_altitude: number;
}

export interface WeatherStationMarkerData {
  id: string;
  station_id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface ForecastCache1hr {
  time: string;
  location_id: string;
  windSpeed1000hPa: number;
  windDirection1000hPa: number;
  windDirection925hPa: number;
  windSpeed925hPa: number;
  windSpeed850hPa: number;
  windDirection850hPa: number;
  windSpeed700hPa: number;
  windDirection700hPa: number;
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
  landing_wind?: number;
  landing_gust?: number;
  landing_wind_direction?: number;
  isPromising: boolean;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'created_at' | 'updated_at'>>;
      };
      paragliding_locations: {
        Row: ParaglidingLocation;
        Insert: Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>>;
      };
      weather_stations: {
        Row: WeatherStation;
        Insert: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>>;
      };

      WEATHER_FORECAST_72h: {
        Row: ForecastCache1hr;
        Insert: Omit<ForecastCache1hr, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ForecastCache1hr, 'created_at' | 'updated_at'>>;
      };
    };
  };
};