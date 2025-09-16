import { useCallback, useState } from 'react';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { AllParaglidingLocationService } from '@/lib/supabase/allParaglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { dataCache } from '@/lib/data-cache';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

type DataSource = 'main' | 'all';

interface UseDataLoadingProps {
  dataSource?: DataSource;
}

export const useDataLoading = ({ dataSource = 'main' }: UseDataLoadingProps = {}) => {
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataLoadingError, setDataLoadingError] = useState<string | null>(null);


  const loadAllData = useCallback(async () => {
    setIsDataLoading(true);
    setDataLoadingError(null);

    try {
      const isMainDataSource = dataSource === 'main';

      let weatherStations: WeatherStationMarkerData[] | null = await dataCache.getWeatherStations();

      let paraglidingLocations: ParaglidingMarkerData[] | null = isMainDataSource
        ? await dataCache.getParaglidingLocations()
        : await dataCache.getAllParaglidingLocations();

      if (!paraglidingLocations) {
        paraglidingLocations = isMainDataSource
          ? await ParaglidingLocationService.getAllActiveForMarkersWithForecast()
          : await AllParaglidingLocationService.getAllActiveForMarkers();

        await (isMainDataSource
          ? dataCache.setParaglidingLocations(paraglidingLocations)
          : dataCache.setAllParaglidingLocations(paraglidingLocations));
      }

      if (!weatherStations) {
        weatherStations = await WeatherStationService.getNordicCountriesForMarkers();
        await dataCache.setWeatherStations(weatherStations);
      }

      return {
        paraglidingLocations,
        weatherStations,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setDataLoadingError(errorMessage);
      console.error('Error loading data:', err);
      throw err;
    } finally {
      setIsDataLoading(false);
    }
  }, [dataSource]);

  return {
    loadAllData,
    isDataLoading,
    dataLoadingError
  };
};
