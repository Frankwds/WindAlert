import { z } from 'zod';

export const metFrostGeometrySchema = z.object({
  '@type': z.string(), // Allow any string instead of strict literal
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
  nearest: z.boolean(),
}).nullable().optional();

export const metFrostStationSchema = z.object({
  '@type': z.string(), // Allow any string instead of strict literal
  id: z.string(),
  name: z.string().nullable().optional(),
  shortName: z.string().optional(),
  country: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  geometry: metFrostGeometrySchema,
  masl: z.number().nullable().optional(), // meters above sea level
  validFrom: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  countyId: z.number().nullable().optional(),
  municipality: z.string().nullable().optional(),
  municipalityId: z.number().nullable().optional(),
  ontologyId: z.number().nullable().optional(),
  stationHolders: z.array(z.string()).nullable().optional(),
  externalIds: z.array(z.string()).nullable().optional(),
  wigosId: z.string().nullable().optional(),
  shipCodes: z.array(z.string()).nullable().optional(),
});

export type MetFrostStation = z.infer<typeof metFrostStationSchema>;

export const metFrostResponseSchema = z.object({
  '@context': z.string(),
  '@type': z.string(), // Allow any string instead of strict literal
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

// Schema for MET observations response (for station data)
export const metObservationLevelSchema = z.object({
  levelType: z.string(),
  unit: z.string(),
  value: z.number(),
});

export const metObservationSchema = z.object({
  elementId: z.string(),
  value: z.number(),
  unit: z.string().nullable().optional(),
  level: metObservationLevelSchema.optional(),
  timeOffset: z.string().optional(),
  timeResolution: z.string().optional(),
  timeSeriesId: z.number().optional(),
  performanceCategory: z.string().optional(),
  exposureCategory: z.string().optional(),
  qualityCode: z.number().optional(),
});

export const metObservationsDataSchema = z.object({
  sourceId: z.string(),
  referenceTime: z.string().datetime(),
  observations: z.array(metObservationSchema),
});

export const metObservationsResponseSchema = z.object({
  '@context': z.string().url(),
  '@type': z.string(),
  apiVersion: z.string(),
  license: z.string().url(),
  createdAt: z.string().datetime(),
  queryTime: z.number(),
  currentItemCount: z.number().int(),
  itemsPerPage: z.number().int(),
  offset: z.number().int(),
  totalItemCount: z.number().int(),
  currentLink: z.string().url().optional(),
  data: z.array(metObservationsDataSchema),
});

export type MetObservation = z.infer<typeof metObservationSchema>;
export type MetObservationsData = z.infer<typeof metObservationsDataSchema>;
export type MetObservationsResponse = z.infer<typeof metObservationsResponseSchema>;