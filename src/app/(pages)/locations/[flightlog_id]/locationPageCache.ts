import { cache } from 'react';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';

/** Single Supabase read per request for metadata + JSON-LD. */
export const getCachedLocationByFlightlogId = cache(async (flightlogId: string) =>
  ParaglidingLocationService.getByFlightlogId(flightlogId)
);
