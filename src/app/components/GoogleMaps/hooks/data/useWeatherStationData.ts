import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { dataCache } from '@/lib/data-cache';

export const useWeatherStationData = () => {
  const loadWeatherStationData = useCallback(async () => {
    try {
      let weatherStations = await dataCache.getWeatherStations();

      if (!weatherStations) {
        weatherStations = await WeatherStationService.getAllActiveWithData();
        weatherStations = weatherStations || [];
        await dataCache.setWeatherStations(weatherStations);
      }

      return weatherStations;
    } catch (err) {
      console.error('Error loading weather station data:', err);
      throw err;
    }
  }, []);

  return {
    loadWeatherStationData
  };
};
