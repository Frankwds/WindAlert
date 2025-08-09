import { z } from 'zod';

const InstantDetailsSchema = z.object({
  air_pressure_at_sea_level: z.number(),
  air_temperature: z.number(),
  air_temperature_percentile_10: z.number(),
  air_temperature_percentile_90: z.number(),
  cloud_area_fraction: z.number(),
  cloud_area_fraction_high: z.number(),
  cloud_area_fraction_low: z.number(),
  cloud_area_fraction_medium: z.number(),
  dew_point_temperature: z.number(),
  fog_area_fraction: z.number(),
  relative_humidity: z.number(),
  ultraviolet_index_clear_sky: z.number(),
  wind_from_direction: z.number(),
  wind_speed: z.number(),
  wind_speed_of_gust: z.number(),
});

const Next1HoursDetailsSchema = z.object({
  precipitation_amount: z.number(),
  precipitation_amount_max: z.number(),
  precipitation_amount_min: z.number(),
  probability_of_precipitation: z.number(),
  probability_of_thunder: z.number(),
});

const Next1HoursSchema = z.object({
  summary: z.object({
    symbol_code: z.string(),
  }),
  details: Next1HoursDetailsSchema,
});

const TimeSeriesSchema = z.object({
  time: z.string(),
  data: z.object({
    instant: z.object({
      details: InstantDetailsSchema,
    }),
    next_1_hours: Next1HoursSchema,
  }),
});

const InstantDetailsSchema6Hour = z.object({
  air_pressure_at_sea_level: z.number(),
  air_temperature: z.number(),
  air_temperature_percentile_10: z.number(),
  air_temperature_percentile_90: z.number(),
  cloud_area_fraction: z.number(),
  cloud_area_fraction_high: z.number(),
  cloud_area_fraction_low: z.number(),
  cloud_area_fraction_medium: z.number(),
  dew_point_temperature: z.number(),
  relative_humidity: z.number(),
  wind_from_direction: z.number(),
  wind_speed: z.number(),
  wind_speed_percentile_10: z.number(),
  wind_speed_percentile_90: z.number(),
});

const Next6HoursDetailsSchema = z.object({
  air_temperature_max: z.number(),
  air_temperature_min: z.number(),
  precipitation_amount: z.number(),
  precipitation_amount_max: z.number(),
  precipitation_amount_min: z.number(),
  probability_of_precipitation: z.number(),
});

const Next6HoursSchema = z.object({
  summary: z.object({
    symbol_code: z.string(),
  }),
  details: Next6HoursDetailsSchema,
});

const TimeSeriesSchema6Hours = z.object({
  time: z.string(),
  data: z.object({
    instant: z.object({
      details: InstantDetailsSchema6Hour,
    }),
    next_6_hours: Next6HoursSchema,
  }),
});

export const metNoResponseSchema = z.object({
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: z.object({
    meta: z.object({
      updated_at: z.string(),
    }),
  }),
});

export const hourlySchema = z.array(TimeSeriesSchema)
export const sixHourlySchema = z.array(TimeSeriesSchema6Hours)