import { z } from 'zod';

const InstantDetailsSchema = z.object({
  air_pressure_at_sea_level: z.number().optional(),
  air_temperature: z.number().optional(),
  cloud_area_fraction: z.number().optional(),
  cloud_area_fraction_high: z.number().optional(),
  cloud_area_fraction_low: z.number().optional(),
  cloud_area_fraction_medium: z.number().optional(),
  dew_point_temperature: z.number().optional(),
  fog_area_fraction: z.number().optional(),
  relative_humidity: z.number().optional(),
  ultraviolet_index_clear_sky: z.number().optional(),
  wind_from_direction: z.number().optional(),
  wind_speed: z.number().optional(),
  wind_speed_of_gust: z.number().optional(),
});

const Next1HoursDetailsSchema = z.object({
  precipitation_amount: z.number().optional(),
  precipitation_amount_max: z.number().optional(),
  precipitation_amount_min: z.number().optional(),
  probability_of_precipitation: z.number().optional(),
  probability_of_thunder: z.number().optional(),
});

const Next1HoursSchema = z.object({
  summary: z.object({
    symbol_code: z.string().optional(),
  }),
  details: Next1HoursDetailsSchema.optional(),
});

const TimeSeriesSchema = z.object({
  time: z.string(),
  data: z.object({
    instant: z.object({
      details: InstantDetailsSchema.optional(),
    }),
    next_1_hours: Next1HoursSchema.optional(),
  }),
});

export const metNoResponseSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number(), z.number()]),
  }),
  properties: z.object({
    meta: z.object({
      updated_at: z.string(),
    }),
    timeseries: z.array(TimeSeriesSchema),
  }),
});
