interface BaseWeatherDataPoint {
  time: string;
  air_pressure_at_sea_level: number;
  air_temperature: number;
  air_temperature_percentile_10: number;
  air_temperature_percentile_90: number;
  cloud_area_fraction: number;
  cloud_area_fraction_high: number;
  cloud_area_fraction_low: number;
  cloud_area_fraction_medium: number;
  dew_point_temperature: number;
  relative_humidity: number;
  wind_from_direction: number;
  wind_speed: number;
  precipitation_amount: number;
  precipitation_amount_max: number;
  precipitation_amount_min: number;
  probability_of_precipitation: number;
  symbol_code: string;
}

export interface WeatherDataPointYr1h extends BaseWeatherDataPoint {
  fog_area_fraction: number;
  ultraviolet_index_clear_sky: number;
  wind_speed_of_gust: number;
  probability_of_thunder: number;
}

export interface WeatherDataPointYr6h extends BaseWeatherDataPoint {
  wind_speed_percentile_10: number;
  wind_speed_percentile_90: number;
  air_temperature_max: number;
  air_temperature_min: number;
}

export interface WeatherDataPointYr {
  weatherDataPointYr1h: WeatherDataPointYr1h[];
  weatherDataPointYr6h: WeatherDataPointYr6h[];
  updated_at: string;
  elevation: number;
  location: {
    latitude: number;
    longitude: number;
  };
}