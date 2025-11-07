import { useCallback } from 'react';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { StationDataService } from '@/lib/supabase/stationData';
import { WeatherStationWithLatestData } from '@/lib/supabase/types';

export const useWeatherStationData = (isMain: boolean) => {
  const loadLatestWeatherStationData = useCallback(async (): Promise<WeatherStationWithLatestData[]> => {
    try {
      // Fetch weather stations metadata
      const weatherStations = await WeatherStationService.getAllActive(isMain);

      // Fetch latest data points for all stations
      const latestData = await StationDataService.getLatestStationData();

      // Create a map of station_id to latest data for efficient lookup
      const latestDataMap = new Map(latestData.map(data => [data.station_id, data]));

      // Combine weather stations with their latest data
      const stationsWithLatestData: WeatherStationWithLatestData[] = weatherStations
        .map(station => {
          const latestStationData = latestDataMap.get(station.station_id);
          if (!latestStationData) {
            // Skip stations that don't have any data
            return null;
          }

          return {
            ...station,
            station_data: latestStationData,
          } as WeatherStationWithLatestData;
        })
        .filter((station): station is WeatherStationWithLatestData => station !== null);

      console.log(`Combined ${stationsWithLatestData.length} weather stations with latest data`);
      return stationsWithLatestData;
    } catch (err) {
      console.error('Error loading latest weather station data:', err);
      throw err;
    }
  }, [isMain]);

  return {
    loadLatestWeatherStationData,
  };
};
