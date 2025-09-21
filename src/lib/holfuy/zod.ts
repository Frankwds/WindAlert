import { z } from 'zod';

export const windDataSchema = z.object({
  speed: z.number(),
  gust: z.number(),
  min: z.number(),
  unit: z.string(),
  direction: z.number(),
});

export const holfuyStationDataSchema = z.object({
  stationId: z.number(),
  stationName: z.string(),
  location: z.object({
    latitude: z.string(),
    longitude: z.string(),
    altitude: z.number(),
  }),
  dateTime: z.string(),
  wind: windDataSchema,
  humidity: z.number().optional(),
  pressure: z.number().optional(),
  rain: z.number().optional(),
  temperature: z.number().optional(),
});

export type HolfuyStationData = z.infer<typeof holfuyStationDataSchema>;

export const holfuyResponseSchema = z.array(holfuyStationDataSchema);
