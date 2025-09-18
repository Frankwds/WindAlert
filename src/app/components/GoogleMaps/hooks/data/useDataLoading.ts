import { useCallback } from 'react';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { AllParaglidingLocationService } from '@/lib/supabase/allParaglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { dataCache } from '@/lib/data-cache';

type Variant = 'main' | 'all';

interface UseDataLoadingProps {
  variant: Variant;
}

export const useDataLoading = ({ variant }: UseDataLoadingProps) => {
  const loadAllData = useCallback(async () => {
    try {
      let paraglidingLocations = variant === 'main'
        ? await dataCache.getParaglidingLocations()
        : await dataCache.getAllParaglidingLocations();
      let weatherStations = await dataCache.getWeatherStations();

      if (!paraglidingLocations || !weatherStations) {
        const [fetchedParaglidingLocations, fetchedWeatherStations] = await Promise.all([
          variant === 'main'
            ? ParaglidingLocationService.getAllActiveForMarkersWithForecast()
            : AllParaglidingLocationService.getAllActiveForMarkers(),
          WeatherStationService.getAllActiveWithData()
        ]);

        paraglidingLocations = fetchedParaglidingLocations || [];
        weatherStations = fetchedWeatherStations || [];

        await Promise.all([
          variant === 'main'
            ? dataCache.setParaglidingLocations(paraglidingLocations)
            : dataCache.setAllParaglidingLocations(paraglidingLocations),
          dataCache.setWeatherStations(weatherStations)
        ]);
      }

      return { paraglidingLocations, weatherStations };
    } catch (err) {
      console.error('Error loading data:', err);
      throw err;
    }
  }, [variant]);

  return {
    loadAllData
  };
};
