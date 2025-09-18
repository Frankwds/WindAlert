import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarkers } from '../../MarkerSetup';
import { WeatherStationMarkerData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';
import { usePageVisibility } from '@/lib/hooks/usePageVisibility';

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
  const isTabVisibleRef = usePageVisibility();

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



  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && weatherStationMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, isLoadingMarkers, weatherStationMarkers.length, loadMarkers]);

  // Set up 5-minute live updates
  useEffect(() => {
    if (mapInstance && weatherStationMarkers.length > 0) {
      intervalRef.current = setInterval(() => {
        if (!isTabVisibleRef.current) {
          return;
        }
        updateMarkersWithLatestData();
      }, 8 * 1 * 1000); // 8 minutes

      // Cleanup interval on unmount or when dependencies change
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [mapInstance, weatherStationMarkers.length]);

  return {
    weatherStationMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError
  };
};
