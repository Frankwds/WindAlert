import { useCallback } from 'react';
import { AllParaglidingLocationService } from '@/lib/supabase/allParaglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { dataCache } from '@/lib/data-cache';

export const useDataLoadingAll = () => {
  const loadAllData = useCallback(async () => {
    try {
      let paraglidingLocations = await dataCache.getAllParaglidingLocations();
      let weatherStations = await dataCache.getWeatherStations();

      if (!paraglidingLocations || !weatherStations) {
        const [fetchedParaglidingLocations, fetchedWeatherStations] = await Promise.all([
          AllParaglidingLocationService.getAllActiveForMarkers(),
          WeatherStationService.getAllActiveWithData()
        ]);

        paraglidingLocations = fetchedParaglidingLocations || [];
        weatherStations = fetchedWeatherStations || [];

        await Promise.all([
          dataCache.setParaglidingLocations(paraglidingLocations),
          dataCache.setWeatherStations(weatherStations)
        ]);
      }

      return { paraglidingLocations, weatherStations };
    } catch (err) {
      console.error('Error loading all data:', err);
      throw err;
    }
  }, []);

  return {
    loadAllData
  };
};
