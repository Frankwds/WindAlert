import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarkers } from '../../MarkerSetup';
import { WeatherStationMarkerData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';
import { usePageVisibility } from '@/lib/hooks/usePageVisibility';
import { WEATHER_STATIONS_UPDATE_INTERVAL } from '@/lib/data-cache';

interface UseWeatherStationMarkersProps {
  mapInstance: google.maps.Map | null;
  onWeatherStationMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationMarkerData) => void;
}

export const useWeatherStationMarkers = ({ mapInstance, onWeatherStationMarkerClick }: UseWeatherStationMarkersProps) => {
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadWeatherStationData, loadLatestWeatherStationData } = useWeatherStationData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isVisibleRef, isVisibleState } = usePageVisibility();

  const loadMarkers = useCallback(async () => {
    if (isLoadingMarkers) return;
    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const { weatherStations } = await loadWeatherStationData();
      const markers = createWeatherStationMarkers(weatherStations, onWeatherStationMarkerClick);
      setWeatherStationMarkers(markers);

    } catch (err) {
      console.error('Error loading weather station markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load weather station markers');
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [onWeatherStationMarkerClick, isLoadingMarkers, loadWeatherStationData]);

  const updateMarkersWithLatestData = useCallback(async () => {
    try {
      const weatherStations = await loadLatestWeatherStationData();
      if (weatherStations) {
        const markers = createWeatherStationMarkers(weatherStations, onWeatherStationMarkerClick);
        setWeatherStationMarkers(markers);
      }
    } catch (err) {
      console.error('Error updating weather station markers with latest data:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to update weather station markers');
    }
  }, [onWeatherStationMarkerClick, loadLatestWeatherStationData]);

  // Load markers on page load
  useEffect(() => {
    if (mapInstance && weatherStationMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, weatherStationMarkers.length, loadMarkers]);

  // Load markers on page visibility change
  // useEffect(() => {
  //   if (isVisibleState && !isFirstLoad) {
  //     loadMarkers();
  //   }
  // }, [isVisibleState]);

  // Set up 15-minute live updates starting at the next 15-minute mark
  useEffect(() => {
    if (mapInstance && weatherStationMarkers.length > 0) {
      const now = new Date();
      const currentMinutes = now.getMinutes();


      const minutesToNext = 15 - (currentMinutes % 15) + 1; // +1 for padding
      const delay = minutesToNext * 60 * 1000;

      const timeoutId = setTimeout(() => {
        console.log('Updating markers with latest data');
        updateMarkersWithLatestData();

        // Now start the regular 15-minute interval
        intervalRef.current = setInterval(() => {
          // skip if tab is not in use
          if (!isVisibleRef.current) {
            return;
          }
          updateMarkersWithLatestData();
        }, WEATHER_STATIONS_UPDATE_INTERVAL);
      }, delay);

      // Cleanup timeout and interval on unmount or when dependencies change
      return () => {
        clearTimeout(timeoutId);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mapInstance, weatherStationMarkers.length, updateMarkersWithLatestData, isVisibleRef]);

  return {
    weatherStationMarkers,
    isLoadingMarkers,
    markersError
  };
};
