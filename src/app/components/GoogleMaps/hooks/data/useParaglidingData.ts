import { useCallback } from 'react';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { AllParaglidingLocationService } from '@/lib/supabase/allParaglidingLocations';
import { dataCache } from '@/lib/data-cache';

type Variant = 'main' | 'all';

interface UseParaglidingDataProps {
  variant: Variant;
}

export const useParaglidingData = ({ variant }: UseParaglidingDataProps) => {
  const loadParaglidingData = useCallback(async () => {
    try {
      let paraglidingLocations = variant === 'main'
        ? await dataCache.getParaglidingLocations()
        : await dataCache.getAllParaglidingLocations();

      if (!paraglidingLocations) {
        paraglidingLocations = variant === 'main'
          ? await ParaglidingLocationService.getAllMainLocationsWithForecast()
          : await AllParaglidingLocationService.getAllActiveLocations();
        paraglidingLocations = paraglidingLocations || [];

        if (variant === 'main') {
          await dataCache.setParaglidingLocations(paraglidingLocations);
        } else {
          await dataCache.setAllParaglidingLocations(paraglidingLocations);
        }
      }

      return paraglidingLocations;
    } catch (err) {
      console.error('Error loading paragliding data:', err);
      throw err;
    }
  }, [variant]);

  return {
    loadParaglidingData
  };
};
