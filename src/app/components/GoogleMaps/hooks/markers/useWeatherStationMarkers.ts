import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarkers } from '../../MarkerSetup';
import { WeatherStationWithLatestData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';
import { usePageVisibility } from '@/lib/hooks/usePageVisibility';

interface UseWeatherStationMarkersProps {
  mapInstance: google.maps.Map | null;
  onWeatherStationMarkerClick: (
    marker: google.maps.marker.AdvancedMarkerElement,
    location: WeatherStationWithLatestData
  ) => void;
  isMain: boolean;
}

export const useWeatherStationMarkers = ({
  mapInstance,
  onWeatherStationMarkerClick,
  isMain,
}: UseWeatherStationMarkersProps) => {
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadLatestWeatherStationData } = useWeatherStationData(isMain);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const hasLoadedInitialMarkers = useRef<boolean>(false);
  const { isVisibleRef, isVisibleState } = usePageVisibility();

  const loadMarkers = useCallback(async () => {
    if (isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const weatherStations = await loadLatestWeatherStationData();

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
      const weatherStations = await loadLatestWeatherStationData();
      if (weatherStations) {
        const markers = createWeatherStationMarkers(weatherStations, onWeatherStationMarkerClick);
        setWeatherStationMarkers(markers);
        setMarkersError(null); // Clear any previous error on success
      }
    } catch (err) {
      // Only log the error - don't set a fatal error for background refresh failures.
      // The existing markers are still valid and displayed on the map.
      console.error('Error updating weather station markers with latest data:', err);
    } finally {
      isLoadingRef.current = false;
    }
  }, [onWeatherStationMarkerClick, loadLatestWeatherStationData]);

  // Load markers on page load with a 2-second delay to prevent simultaneous database queries
  useEffect(() => {
    if (mapInstance && !hasLoadedInitialMarkers.current) {
      const timeoutId = setTimeout(() => {
        loadMarkers();
      }, 2000); // 2-second delay to allow paragliding locations to load first

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [mapInstance, loadMarkers]);

  // Load markers on page visibility change (with delay for mobile network recovery)
  useEffect(() => {
    if (isVisibleState && hasLoadedInitialMarkers.current) {
      // Small delay to allow mobile network to reconnect after page unfreeze
      const timeoutId = setTimeout(() => {
        updateMarkersWithLatestData();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [updateMarkersWithLatestData, isVisibleState]);

  // Set up 5-minute live updates starting at the next 5-minute mark
  useEffect(() => {
    if (mapInstance && weatherStationMarkers.length > 0) {
      const now = new Date();
      const currentMinutes = now.getMinutes();

      // Calculate minutes to next 5-minute mark (1, 6, 11, 16, etc.)
      const minutesToNext = 5 - (currentMinutes % 5) + 1;
      const delay = minutesToNext * 60 * 1000;

      const timeoutId = setTimeout(() => {
        updateMarkersWithLatestData();

        // Now start the regular 5-minute interval
        intervalRef.current = setInterval(
          () => {
            // skip if tab is not in use
            if (!isVisibleRef.current) {
              return;
            }
            updateMarkersWithLatestData();
          },
          5 * 60 * 1000
        ); // 5 minutes
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
    markersError,
  };
};
