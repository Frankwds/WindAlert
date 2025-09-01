export interface User {
  id: string;
  email: string;
  name: string | null;
  google_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FavouriteLocation {
  id: string;
  user_id: string;
  location_id: string;
  created_at: string;
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

export interface MinimalForecast {
  time: string;
  weather_code: string;
  temperature: number;
  wind_speed: number;
  wind_gusts: number;
  wind_direction: number;
  is_promising: boolean;
}

export interface ParaglidingMarkerData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  forecast_cache?: MinimalForecast[];
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
  // Basic identification
  // time is a datetime object
  time: string;
  location_id: string;

  // Surface conditions
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts: number;
  precipitation: number;
  precipitation_probability: number;
  pressure_msl: number;
  weather_code: string;
  is_day: 0 | 1;

  // Validation
  is_promising: boolean;
  validation_failures: string;
  validation_warnings: string;


  // Landing conditions
  landing_wind?: number;
  landing_gust?: number;
  landing_wind_direction?: number;

  // Atmospheric conditions - Wind at different pressure levels
  wind_speed_1000hpa: number;
  wind_direction_1000hpa: number;
  wind_speed_925hpa: number;
  wind_direction_925hpa: number;
  wind_speed_850hpa: number;
  wind_direction_850hpa: number;
  wind_speed_700hpa: number;
  wind_direction_700hpa: number;

  // Atmospheric conditions - Temperature at different pressure levels
  temperature_1000hpa: number;
  temperature_925hpa: number;
  temperature_850hpa: number;
  temperature_700hpa: number;

  // Atmospheric conditions - Cloud cover
  cloud_cover: number;
  cloud_cover_low: number;
  cloud_cover_mid: number;
  cloud_cover_high: number;

  // Atmospheric conditions - Stability and convection
  cape: number;
  convective_inhibition: number;
  lifted_index: number;
  boundary_layer_height: number;
  freezing_level_height: number;

  // Atmospheric conditions - Geopotential heights
  geopotential_height_1000hpa: number;
  geopotential_height_925hpa: number;
  geopotential_height_850hpa: number;
  geopotential_height_700hpa: number;
}

export interface YrCache {
  location_id: string;
  expires: string;
  last_modified: string;
  data: any;
}

export type Database = {
  public: {
    Tables: {
      yr_cache: {
        Row: YrCache;
        Insert: YrCache;
        Update: Partial<YrCache>;
      };
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
      favourite_locations: {
        Row: FavouriteLocation;
        Insert: Omit<FavouriteLocation, 'id' | 'created_at'>;
        Update: Partial<Omit<FavouriteLocation, 'id' | 'created_at'>>;
      };
      forecast_cache: {
        Row: ForecastCache1hr;
        Insert: Omit<ForecastCache1hr, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ForecastCache1hr, 'created_at' | 'updated_at'>>;
      };
    };
  };
};