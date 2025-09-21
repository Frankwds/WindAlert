export interface FavouriteLocation {
  id: string;
  user_id: string;
  location_id: string;
  created_at: string;
}

export interface ParaglidingLocation {
  id: string;
  name: string;
  description: string | null;
  longitude: number;
  latitude: number;
  altitude: number;
  country: string;
  flightlog_id: string;
  is_active: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
}

export interface ParaglidingLocationWithForecast {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  flightlog_id: string;
  is_main: boolean;
  forecast_cache?: MinimalForecast[];
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
}

export interface ParaglidingLocationForCache {
  id: string;
  latitude: number;
  longitude: number;
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
}

// Import MinimalForecast from forecast types
import { MinimalForecast } from './forecast';
