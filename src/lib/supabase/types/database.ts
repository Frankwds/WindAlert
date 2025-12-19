import { ParaglidingLocation } from './paraglidingLocation';
import { FavouriteLocation } from './favouriteLocation';
import { WeatherStation } from './weatherStation';
import { StationData } from './stationData';
import { ForecastCache1hr } from './forecastCache';
import { ChangelogLanding } from './changelogLanding';
import { ChangelogIsMain } from './changelogIsMain';

export type Database = {
  public: {
    Tables: {
      all_paragliding_locations: {
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
      changelog_landings: {
        Row: ChangelogLanding;
        Insert: Omit<ChangelogLanding, 'id' | 'created_at'>;
        Update: Partial<Omit<ChangelogLanding, 'id' | 'created_at'>>;
      };
      changelog_is_main: {
        Row: ChangelogIsMain;
        Insert: Omit<ChangelogIsMain, 'id' | 'created_at'>;
        Update: Partial<Omit<ChangelogIsMain, 'id' | 'created_at'>>;
      };
    };
    Views: {
      locations_with_oldest_forecast: {
        Row: { id: string };
        Insert: never;
        Update: never;
      };
      locations_without_forecast: {
        Row: { id: string };
        Insert: never;
        Update: never;
      };
    };
  };
};
