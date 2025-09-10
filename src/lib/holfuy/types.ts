import { z } from 'zod';
import { holfuyResponseSchema } from './zod';

export interface WindData {
  speed: number;
  gust: number;
  min: number;
  unit: string;
  direction: number;
}

export interface HolfuyStationData {
  stationId: number;
  stationName: string;
  dateTime: string;
  wind: WindData;
  humidity?: number;
  pressure?: number;
  rain?: number;
  temperature?: number;
}

export type HolfuyResponse = z.infer<typeof holfuyResponseSchema>;
