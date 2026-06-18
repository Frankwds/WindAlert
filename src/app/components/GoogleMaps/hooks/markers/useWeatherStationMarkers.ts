import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarker, updateWeatherStationMarker } from '../../MarkerSetup';
import { WeatherStationWithLatestData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';
import { usePageVisibility } from '@/lib/hooks/usePageVisibility';

type WeatherStationMarkerEntry = {
  marker: google.maps.marker.AdvancedMarkerElement;
  observationKey: string;
};

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
  const markerRegistryRef = useRef<Map<string, WeatherStationMarkerEntry>>(new Map());
  const { isVisibleRef, isVisibleState } = usePageVisibility();

  const loadMarkers = useCallback(async () => {
    if (isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const weatherStations = await loadLatestWeatherStationData();

      const registry = new Map<string, WeatherStationMarkerEntry>();
      const markers = weatherStations.map(location => {
        const marker = createWeatherStationMarker(location, onWeatherStationMarkerClick);
        registry.set(location.station_id, { marker, observationKey: location.station_data.updated_at });
        return marker;
      });
      markerRegistryRef.current = registry;
      setWeatherStationMarkers(markers);
      hasLoadedInitialMarkers.current = true;
    } catch (err) {
      console.error('Error loading weather station markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Det skjedde en feil ved innlastning av værstasjoner');
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
        const registry = markerRegistryRef.current;
        const nextStationIds = new Set<string>();
        let membershipChanged = false;

        for (const location of weatherStations) {
          nextStationIds.add(location.station_id);
          const observationKey = location.station_data.updated_at;
          const existing = registry.get(location.station_id);

          if (!existing) {
            // New station entered the live dataset: create a marker for it.
            const marker = createWeatherStationMarker(location, onWeatherStationMarkerClick);
            registry.set(location.station_id, { marker, observationKey });
            membershipChanged = true;
          } else if (existing.observationKey !== observationKey) {
            // Latest observation changed: update the existing marker's DOM in place
            // so its instance (and any anchored info window) is preserved.
            updateWeatherStationMarker(existing.marker, location);
            existing.observationKey = observationKey;
          }
          // Unchanged observation: skip entirely.
        }

        // Remove markers for stations no longer present in the live dataset.
        for (const [stationId, entry] of registry) {
          if (!nextStationIds.has(stationId)) {
            entry.marker.map = null;
            registry.delete(stationId);
            membershipChanged = true;
          }
        }

        // Only replace the markers array (which re-runs the clusterer) when
        // markers are added or removed. Pure in-place observation updates leave
        // React state and the clusterer untouched.
        if (membershipChanged) {
          setWeatherStationMarkers(Array.from(registry.values(), entry => entry.marker));
        }

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
