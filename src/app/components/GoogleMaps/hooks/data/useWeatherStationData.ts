import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { dataCache } from '@/lib/data-cache';

export const useWeatherStationData = () => {

  const loadLatestWeatherStationData = useCallback(async (firstLoad: boolean, isMain?: boolean) => {
    try {
      const allWeatherStations = await dataCache.getWeatherStations();
      if (!allWeatherStations || !allWeatherStations[0].station_data) {
        if (firstLoad) {
          const updatedWeatherStations = await WeatherStationService.getAllActiveWithData(isMain);
          await dataCache.setWeatherStations(updatedWeatherStations);
          return updatedWeatherStations;
        }
        console.warn('No cached weather station data to append to');
        return null;
      }

      const sortedStationData = allWeatherStations[0].station_data
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      const latestUpdateTime = sortedStationData[0].updated_at;

      // check if latestCacheTimestamp is older than 30 minutes
      if (new Date(latestUpdateTime).getTime() < Date.now() - 30 * 60 * 1000) {
        const updatedWeatherStations = await WeatherStationService.getAllActiveWithData(isMain);
        await dataCache.setWeatherStations(updatedWeatherStations);
        return updatedWeatherStations;
      }

      const latestData = await StationDataService.getAllStationDataNewerThan(latestUpdateTime);

      if (latestData && latestData.length > 0) {
        const updatedWeatherStations = await dataCache.appendWeatherStationData(latestData);
        return updatedWeatherStations;
      }

      if (firstLoad) {
        return allWeatherStations;
      }
      return null;
    } catch (err) {
      console.error('Error loading latest weather station data:', err);
      throw err;
    }
  }, []);

  return {
    loadLatestWeatherStationData
  };
};
