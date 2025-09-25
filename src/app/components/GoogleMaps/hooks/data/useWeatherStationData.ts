import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { dataCache } from '@/lib/data-cache';

export const useWeatherStationData = () => {

  const loadLatestWeatherStationData = useCallback(async (firstLoad: boolean, isMain?: boolean) => {
    try {
      const cachedWeatherStations = await dataCache.getWeatherStations();

      if (!cachedWeatherStations || cachedWeatherStations.length === 0) {
        // No cache - get all stations with latest data
        const updatedWeatherStations = await WeatherStationService.getAllActiveWithData(isMain);
        await dataCache.setWeatherStations(updatedWeatherStations);
        return updatedWeatherStations;
      }

      // We have cached data - get latest data from materialized view
      const latestData = await StationDataService.getLatestStationData(isMain);

      if (latestData && latestData.length > 0) {
        // Append only new data points to cache
        const updatedWeatherStations = await dataCache.appendWeatherStationData(latestData);
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
