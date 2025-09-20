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

  const { loadLatestWeatherStationData } = useWeatherStationData();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const hasLoadedInitialMarkers = useRef<boolean>(false);
  const { isVisibleRef, isVisibleState } = usePageVisibility();

  const loadMarkers = useCallback(async () => {
    if (isLoadingRef.current) return;
    try {
      console.log('ACTUALLY CREATING weather station markers');
      isLoadingRef.current = true;
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const weatherStations = await loadLatestWeatherStationData(true);
      if (!weatherStations) {
        throw new Error('Failed to load weather station data in loadLatestWeatherStationData');
      }
      const markers = createWeatherStationMarkers(weatherStations, onWeatherStationMarkerClick);
      setWeatherStationMarkers(markers);
      hasLoadedInitialMarkers.current = true;

    } catch (err) {
      console.error('Error loading weather station markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load weather station markers');
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMarkers(false);
    }
  }, [onWeatherStationMarkerClick, loadLatestWeatherStationData]);

  const updateMarkersWithLatestData = useCallback(async () => {
    if (isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      console.log('ACTUALLY2 Updating weather station markers with latest data');
      const weatherStations = await loadLatestWeatherStationData(false);
      if (weatherStations) {
        console.log('ACTUALLY2 CREATING weather station markers');
        const markers = createWeatherStationMarkers(weatherStations, onWeatherStationMarkerClick);
        setWeatherStationMarkers(markers);
      }
    } catch (err) {
      console.error('Error updating weather station markers with latest data:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to update weather station markers');
    } finally {
      isLoadingRef.current = false;
    }
  }, [onWeatherStationMarkerClick, loadLatestWeatherStationData]);

  // Load markers on page load
  useEffect(() => {
    if (mapInstance && !hasLoadedInitialMarkers.current) {
      loadMarkers();
    }
  }, [mapInstance, loadMarkers]);

  // Load markers on page visibility change
  useEffect(() => {
    if (isVisibleState && hasLoadedInitialMarkers.current) {
      updateMarkersWithLatestData();
    }
  }, [updateMarkersWithLatestData, isVisibleState]);

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
