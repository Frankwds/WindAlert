import { User } from './user';
import { FavouriteLocation, ParaglidingLocation } from './location';
import { WeatherStation, StationData } from './weather';
import { ForecastCache1hr } from './forecast';

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
      station_data: {
        Row: StationData;
        Insert: Omit<StationData, 'id'>;
        Update: Partial<Omit<StationData, 'id'>>;
      };
    };
  };
};
