import { z } from 'zod';

// These variables are not always provided by the model selected by Open-Meteo's
// `best_match`, so they can be `null`. Preserve `null` here so the UI can
// conditionally hide them instead of showing a misleading `0`.
const nullableNumberArray = z.array(z.number().nullable());

export const openMeteoResponseSchema = z.object({
  elevation: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    wind_speed_1000hPa: z.array(z.number()),
    wind_direction_1000hPa: z.array(z.number()),
    wind_direction_925hPa: z.array(z.number()),
    wind_speed_925hPa: z.array(z.number()),
    wind_speed_850hPa: z.array(z.number()),
    wind_direction_850hPa: z.array(z.number()),
    wind_direction_700hPa: z.array(z.number()),
    wind_speed_700hPa: z.array(z.number()),
    temperature_1000hPa: z.array(z.number()),
    temperature_925hPa: z.array(z.number()),
    temperature_850hPa: z.array(z.number()),
    temperature_700hPa: z.array(z.number()),
    temperature_2m: z.array(z.number()),
    precipitation: z.array(z.number()),
    precipitation_probability: nullableNumberArray,
    cloud_cover: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    wind_direction_10m: z.array(z.number()),
    wind_gusts_10m: z.array(z.number()),
    weather_code: z.array(z.number()),
    pressure_msl: nullableNumberArray,
    convective_inhibition: nullableNumberArray,
    cloud_cover_low: nullableNumberArray,
    cloud_cover_mid: nullableNumberArray,
    cloud_cover_high: nullableNumberArray,
    is_day: z.array(z.union([z.literal(0), z.literal(1)])),
    freezing_level_height: nullableNumberArray,
    cape: nullableNumberArray,
    lifted_index: nullableNumberArray,
    boundary_layer_height: nullableNumberArray,
    geopotential_height_1000hPa: z.array(z.number()),
    geopotential_height_925hPa: z.array(z.number()),
    geopotential_height_850hPa: z.array(z.number()),
    geopotential_height_700hPa: z.array(z.number()),
  }),
});
