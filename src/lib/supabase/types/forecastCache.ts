export type MinimalForecast = Pick<ForecastCache1hr,
  | 'time'
  | 'is_day'
  | 'weather_code'
  | 'temperature'
  | 'wind_speed'
  | 'wind_gusts'
  | 'wind_direction'
  | 'is_promising'
  | 'landing_wind'
  | 'landing_gust'
  | 'landing_wind_direction'
>;

export interface ForecastCache1hr {
  // Basic identification
  // time is a datetime object
  time: string;
  updated_at?: string;
  location_id: string;

  // Surface conditions
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  wind_gusts?: number;
  precipitation: number;
  precipitation_max?: number;
  precipitation_min?: number;
  precipitation_probability?: number;
  pressure_msl: number;
  weather_code: string;
  is_day: 0 | 1;
  is_yr_data: boolean;

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
