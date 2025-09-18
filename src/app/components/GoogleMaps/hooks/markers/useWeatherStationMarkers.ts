import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarkers } from '../../MarkerSetup';
import { WeatherStationMarkerData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';

interface UseWeatherStationMarkersProps {
  mapInstance: google.maps.Map | null;
  onWeatherStationMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationMarkerData) => void;
}

export const useWeatherStationMarkers = ({ mapInstance, onWeatherStationMarkerClick }: UseWeatherStationMarkersProps) => {
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadWeatherStationData, loadLatestWeatherStationData } = useWeatherStationData();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadMarkers = useCallback(async () => {
    if (isLoadingMarkers) return; // Prevent multiple simultaneous loads

    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const weatherStations = await loadWeatherStationData();
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
    if (isLoadingMarkers) return; // Prevent multiple simultaneous loads

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
  }, [onWeatherStationMarkerClick, isLoadingMarkers, loadLatestWeatherStationData]);

  const debouncedUpdateMarkers = useCallback(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout with 1 second debounce
    debounceTimeoutRef.current = setTimeout(() => {
      updateMarkersWithLatestData();
    }, 1000);
  }, [updateMarkersWithLatestData]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && weatherStationMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, isLoadingMarkers, weatherStationMarkers.length, loadMarkers]);

  // Set up 5-minute live updates
  useEffect(() => {
    if (mapInstance && weatherStationMarkers.length > 0) {
      // Set up interval for live updates every 5 minutes
      intervalRef.current = setInterval(() => {
        debouncedUpdateMarkers();
      }, 5 * 8 * 1000); // 8 minutes

      // Cleanup interval on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }
  }, [mapInstance, weatherStationMarkers.length, debouncedUpdateMarkers]);

  return {
    weatherStationMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError
  };
};
