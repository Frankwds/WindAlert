import { z } from 'zod';

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
  referenceTime: z.iso.datetime(),
  observations: z.array(metObservationSchema),
});

export const metObservationsResponseSchema = z.object({
  '@context': z.string().url(),
  '@type': z.string(),
  apiVersion: z.string(),
  license: z.url(),
  createdAt: z.iso.datetime(),
  queryTime: z.number(),
  currentItemCount: z.number().int(),
  itemsPerPage: z.number().int(),
  offset: z.number().int(),
  totalItemCount: z.number().int(),
  currentLink: z.url().optional(),
  data: z.array(metObservationsDataSchema),
});

export type MetObservation = z.infer<typeof metObservationSchema>;
export type MetObservationsData = z.infer<typeof metObservationsDataSchema>;
export type MetObservationsResponse = z.infer<typeof metObservationsResponseSchema>;
