import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { dataCache } from '@/lib/data-cache';

export const useWeatherStationData = (isMain: boolean) => {

  const loadLatestWeatherStationData = useCallback(async () => {
    try {
      const cachedWeatherStations = await dataCache.getWeatherStations(isMain);

      if (!cachedWeatherStations || cachedWeatherStations.length === 0) {
        // No cache - get all stations with latest data
        const updatedWeatherStations = await WeatherStationService.getAllActiveWithData(isMain);
        await dataCache.setWeatherStations(updatedWeatherStations, isMain);
        return updatedWeatherStations;
      }

      // We have cached data - get latest data from materialized view
      const latestData = await StationDataService.getLatestStationData();

      if (latestData && latestData.length > 0) {
        // Append only new data points to cache
        const updatedWeatherStations = await dataCache.appendWeatherStationData(latestData, isMain);
        return updatedWeatherStations;
      }

      // No new data available, return cached data
      return cachedWeatherStations;
    } catch (err) {
      console.error('Error loading latest weather station data:', err);
      throw err;
    }
  }, []);

  return {
    loadLatestWeatherStationData
  };
};
