import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { dataCache } from '@/lib/data-cache';
import { WeatherStationWithData } from '@/lib/supabase/types';

export const useWeatherStationData = (isMain: boolean) => {

  const sortByUpdatedAt = (a: WeatherStationWithData, b: WeatherStationWithData) => {
    return new Date(b.station_data[0].updated_at).getTime() - new Date(a.station_data[0].updated_at).getTime();
  };

  const loadLatestWeatherStationData = useCallback(async () => {
    try {
      const cachedWeatherStations = await dataCache.getWeatherStations(isMain);

      // If a sample of 10 stations all have latest data older than 35 minutes, we will getAllActiveWithData
      let isOldData = false; // TODO: increase time when we can fetch array of latest data to fill gaps efficiently.
      if (cachedWeatherStations && cachedWeatherStations.length > 0) {
        isOldData = cachedWeatherStations.sort(sortByUpdatedAt).slice(0, 10).filter(station => new Date(station.station_data[0].updated_at).getTime() < Date.now() - 35 * 60 * 1000).length === 10;
      }

      if (!cachedWeatherStations || cachedWeatherStations.length === 0 || isOldData) {
        // No cache - get all stations with latest data
        const updatedWeatherStations = await WeatherStationService.getAllActiveWithData(isMain);
        await dataCache.setWeatherStations(updatedWeatherStations, isMain);
        return updatedWeatherStations;
      }



      // We have cached data - get latest data from materialized view
      const latestData = await StationDataService.getLatestStationData();

      if (latestData && latestData.length > 0) {
        // Append only new data points to cache
        const updatedWeatherStations = await dataCache.appendWeatherStationData(cachedWeatherStations, latestData, isMain);
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
