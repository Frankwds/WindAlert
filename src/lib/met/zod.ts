import { z } from 'zod';

export const metFrostGeometrySchema = z.object({
  '@type': z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
  nearest: z.boolean(),
});

export const metFrostStationSchema = z.object({
  '@type': z.literal('SensorSystem'),
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  country: z.string(),
  countryCode: z.string(),
  geometry: metFrostGeometrySchema,
  masl: z.number().optional(), // meters above sea level
  validFrom: z.string(),
  county: z.string().optional(),
});

export type MetFrostStation = z.infer<typeof metFrostStationSchema>;

export const metFrostResponseSchema = z.object({
  '@context': z.string(),
  '@type': z.literal('SourceResponse'),
  apiVersion: z.string(),
  license: z.string(),
  createdAt: z.string(),
  queryTime: z.number(),
  currentItemCount: z.number(),
  itemsPerPage: z.number(),
  offset: z.number(),
  totalItemCount: z.number(),
  currentLink: z.string(),
  data: z.array(metFrostStationSchema),
});

export type MetFrostResponse = z.infer<typeof metFrostResponseSchema>;
