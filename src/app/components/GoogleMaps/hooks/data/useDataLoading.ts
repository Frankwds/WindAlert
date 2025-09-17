import { useCallback } from 'react';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { dataCache } from '@/lib/data-cache';

export const useDataLoading = () => {
  const loadAllData = useCallback(async () => {
    try {
      let paraglidingLocations = await dataCache.getParaglidingLocations();
      let weatherStations = await dataCache.getWeatherStations();

      if (!paraglidingLocations || !weatherStations) {
        const [fetchedParaglidingLocations, fetchedWeatherStations] = await Promise.all([
          ParaglidingLocationService.getAllActiveForMarkersWithForecast(),
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
      console.error('Error loading data:', err);
      throw err;
    }
  }, []);

  return {
    loadAllData
  };
};
