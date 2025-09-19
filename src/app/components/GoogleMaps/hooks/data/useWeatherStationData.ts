import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { dataCache, WEATHER_STATIONS_UPDATE_INTERVAL } from '@/lib/data-cache';

export const useWeatherStationData = () => {
  const loadWeatherStationData = useCallback(async () => {
    try {
      let weatherStations = await dataCache.getWeatherStations();

      if (!weatherStations) {
        weatherStations = await WeatherStationService.getAllActiveWithData();
        weatherStations = weatherStations || [];
        await dataCache.setWeatherStations(weatherStations);
        return weatherStations;
      }

      const sortedStationData = weatherStations[0].station_data
        .filter(data => data.wind_speed !== null && data.direction !== null)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      const latestCacheTimestamp = sortedStationData[0].updated_at;

      // if latestCacheTimestamp is older than UPDATE_INTERVAL, reload the data
      if (new Date(latestCacheTimestamp).getTime() < Date.now() - WEATHER_STATIONS_UPDATE_INTERVAL) {
        weatherStations = await WeatherStationService.getAllActiveWithData();
        weatherStations = weatherStations || [];
        await dataCache.setWeatherStations(weatherStations);
        return weatherStations;
      }

      return weatherStations;
    } catch (err) {
      console.error('Error loading weather station data:', err);
      throw err;
    }
  }, []);

  const loadLatestWeatherStationData = useCallback(async () => {
    try {
      const allWeatherStations = await dataCache.getWeatherStations();
      if (!allWeatherStations) {
        console.warn('No cached weather station data to append to');
        return null;
      }

      const sortedStationData = allWeatherStations[0].station_data
        .filter(data => data.wind_speed !== null && data.direction !== null)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      const latestCacheTimestamp = sortedStationData[0].updated_at;

      const latestData = await StationDataService.getLatestStationDataForAllNewerThan(latestCacheTimestamp);

      if (latestData && latestData.length > 0) {
        const updatedWeatherStations = await dataCache.appendWeatherStationData(latestData);
        return updatedWeatherStations;
      }

      return null;
    } catch (err) {
      console.error('Error loading latest weather station data:', err);
      throw err;
    }
  }, []);

  return {
    loadWeatherStationData,
    loadLatestWeatherStationData
  };
};
