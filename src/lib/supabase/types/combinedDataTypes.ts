import { MinimalForecast } from './forecastCache';
import { StationData } from './stationData';
import { WeatherStation } from './weatherStation';
import { ParaglidingLocation } from './paraglidingLocation';

// Utility types that extend, omit, or pick from base types
export type WeatherStationWithData = Pick<
  WeatherStation,
  'id' | 'station_id' | 'name' | 'latitude' | 'longitude' | 'altitude' | 'provider' | 'is_main'
> & {
  station_data: StationData[];
};

export type WeatherStationWithLatestData = Pick<
  WeatherStation,
  | 'id'
  | 'station_id'
  | 'name'
  | 'latitude'
  | 'longitude'
  | 'altitude'
  | 'provider'
  | 'is_main'
  | 'country'
  | 'is_active'
  | 'updated_at'
> & {
  station_data: StationData; // Single object, not array
};

export type ParaglidingLocationWithForecast = Pick<
  ParaglidingLocation,
  | 'id'
  | 'name'
  | 'latitude'
  | 'longitude'
  | 'altitude'
  | 'flightlog_id'
  | 'is_main'
  | 'n'
  | 'e'
  | 's'
  | 'w'
  | 'ne'
  | 'se'
  | 'sw'
  | 'nw'
  | 'landing_latitude'
  | 'landing_longitude'
  | 'landing_altitude'
> & {
  forecast_cache?: MinimalForecast[];
};
