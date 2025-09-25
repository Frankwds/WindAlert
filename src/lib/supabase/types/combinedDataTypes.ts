import { MinimalForecast } from "./forecastCache";
import { StationData } from "./stationData";
import { WeatherStation } from "./weatherStation";
import { ParaglidingLocation } from "./paraglidingLocation";

// Utility types that extend, omit, or pick from base types
export type WeatherStationWithData = Pick<WeatherStation,
  | 'id'
  | 'station_id'
  | 'name'
  | 'latitude'
  | 'longitude'
  | 'altitude'
  | 'provider'
> & {
  station_data: StationData[];
};

export type ParaglidingLocationWithForecast = Pick<ParaglidingLocation,
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

