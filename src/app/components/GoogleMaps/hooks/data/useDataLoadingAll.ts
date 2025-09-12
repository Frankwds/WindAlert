import { useCallback } from 'react';
import { AllParaglidingLocationService } from '@/lib/supabase/allParaglidingLocations';
import { dataCache } from '@/lib/data-cache';

export const useDataLoadingAll = () => {
  const loadAllParaglidingData = useCallback(async () => {
    try {
      // Try to get from cache first (no TTL for static data)
      let paraglidingLocations = await dataCache.getAllParaglidingLocations();

      if (!paraglidingLocations) {
        // Fetch from database if not in cache
        paraglidingLocations = await AllParaglidingLocationService.getAllActiveForMarkers();

        // Cache the data (no TTL - it's static)
        await dataCache.setAllParaglidingLocations(paraglidingLocations);
      }

      return { paraglidingLocations };
    } catch (err) {
      console.error('Error loading all paragliding data:', err);
      throw err;
    }
  }, []);

  return {
    loadAllParaglidingData
  };
};
