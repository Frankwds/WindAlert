import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { dataCache } from '@/lib/data-cache';
import { WeatherStationWithData } from '@/lib/supabase/types';

const SAMPLE_SIZE = 50;
const STALE_THRESHOLD_MINUTES = 35;
const SUPER_FRESH_THRESHOLD_MINUTES = 10;

const assessCache = (weatherStations: WeatherStationWithData[] | null): { isSuperFresh: boolean, isProbablyStale: boolean } => {


  if (!weatherStations || weatherStations.length <= SAMPLE_SIZE) {
    return { isSuperFresh: false, isProbablyStale: true };
  }

  // Create a random sample of stations
  const randomSample = weatherStations
    .sort(() => 0.5 - Math.random()) // A simple way to shuffle the array
    .slice(0, SAMPLE_SIZE);         // Take the first 15 from the shuffled list

  // Now, run the efficient check on just this small sample
  const mostRecentUpdateInSample = randomSample
    .flatMap(station => station.station_data)
    .map(dataPoint => new Date(dataPoint.updated_at).getTime())
    .reduce((max, current) => Math.max(max, current), -Infinity);

  // This result is now a "best guess" based on the sample
  return {
    isSuperFresh: mostRecentUpdateInSample > Date.now() - (SUPER_FRESH_THRESHOLD_MINUTES * 60 * 1000),
    isProbablyStale: mostRecentUpdateInSample < Date.now() - (STALE_THRESHOLD_MINUTES * 60 * 1000)
  };
};

export const useWeatherStationData = (isMain: boolean) => {

  const loadLatestWeatherStationData = useCallback(async () => {
    try {
      const cachedWeatherStations = await dataCache.getWeatherStations(isMain);

      // If a sample of stations have latest data older than 35 minutes, we will getAllActiveWithData
      const { isSuperFresh, isProbablyStale } = assessCache(cachedWeatherStations);

      if (isSuperFresh) {
        return cachedWeatherStations;
      }

      if (!cachedWeatherStations || cachedWeatherStations.length === 0 || isProbablyStale) {
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
