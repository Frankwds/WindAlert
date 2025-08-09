export interface WeatherDataPointYr {
  time: string;
  air_pressure_at_sea_level: number;
  air_temperature: number;
  cloud_area_fraction: number;
  cloud_area_fraction_high: number;
  cloud_area_fraction_low: number;
  cloud_area_fraction_medium: number;
  dew_point_temperature: number;
  fog_area_fraction: number;
  relative_humidity: number;
  ultraviolet_index_clear_sky: number;
  wind_from_direction: number;
  wind_speed: number;
  wind_speed_of_gust: number;
  symbol_code: string;
  precipitation_amount: number;
  precipitation_amount_max: number;
  precipitation_amount_min: number;
  probability_of_precipitation: number;
  probability_of_thunder: number;
}

export interface WeatherDataPointYr6h { // Try with 54 in slices in the array, if not write a helper func to decide when to switch.
  time: string;
  air_pressure_at_sea_level: number;
  air_temperature: number;
  cloud_area_fraction: number;
  cloud_area_fraction_high: number;
  cloud_area_fraction_low: number;
  cloud_area_fraction_medium: number;
  dew_point_temperature: number;
  relative_humidity: number;
  wind_from_direction: number;
  wind_speed: number;
  wind_speed_of_gust: number;
  symbol_code: string;
  precipitation_amount: number;
  precipitation_amount_max: number;
  precipitation_amount_min: number;
  probability_of_precipitation: number;
  probability_of_thunder: number;
}
