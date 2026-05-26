import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarker, updateWeatherStationMarker } from '../../MarkerSetup';
import { WeatherStationWithLatestData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';
import { usePageVisibility } from '@/lib/hooks/usePageVisibility';
import { stationLatestObservationKey } from '@/lib/supabase/stationObservationKey';

interface UseWeatherStationMarkersProps {
  mapInstance: google.maps.Map | null;
  onWeatherStationMarkerClick: (
    marker: google.maps.marker.AdvancedMarkerElement,
    location: WeatherStationWithLatestData
  ) => void;
  isMain: boolean;
  getOpenWeatherStationId?: () => string | null;
  isInfoWindowOpen?: () => boolean;
  reopenWeatherStationInfoWindow?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    location: WeatherStationWithLatestData
  ) => void;
}

type WeatherStationMarkerEntry = {
  marker: google.maps.marker.AdvancedMarkerElement;
  observationKey: string;
  location: WeatherStationWithLatestData;
};

const sortStationIds = (ids: string[]) => {
  return [...ids].sort((a, b) => a.localeCompare(b));
};

export const useWeatherStationMarkers = ({
  mapInstance,
  onWeatherStationMarkerClick,
  isMain,
  getOpenWeatherStationId,
  isInfoWindowOpen,
  reopenWeatherStationInfoWindow,
}: UseWeatherStationMarkersProps) => {
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadLatestWeatherStationData } = useWeatherStationData(isMain);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const hasLoadedInitialMarkers = useRef<boolean>(false);
  const weatherStationMarkerRegistryRef = useRef<Map<string, WeatherStationMarkerEntry>>(new Map());
  const onWeatherStationMarkerClickRef = useRef(onWeatherStationMarkerClick);
  const syncMarkersFromLatestDataRef = useRef<((showLoading: boolean) => Promise<void>) | null>(null);
  const { isVisibleRef, isVisibleState } = usePageVisibility();

  useEffect(() => {
    onWeatherStationMarkerClickRef.current = onWeatherStationMarkerClick;
  }, [onWeatherStationMarkerClick]);

  const syncMarkersFromLatestData = useCallback(async (showLoading: boolean) => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      if (showLoading) {
        setIsLoadingMarkers(true);
        setMarkersError(null);
      }

      const weatherStationsWithLatestData = await loadLatestWeatherStationData();
      const markerRegistry = weatherStationMarkerRegistryRef.current;
      const activeStationIds = new Set<string>();
      const observationKeysBeforeSync = new Map<string, string>();
      for (const [stationId, entry] of markerRegistry.entries()) {
        observationKeysBeforeSync.set(stationId, entry.observationKey);
      }

      const openWeatherStationIdAtStart = getOpenWeatherStationId?.() ?? null;
      const previousOpenMarker = openWeatherStationIdAtStart
        ? markerRegistry.get(openWeatherStationIdAtStart)?.marker
        : null;
      let markerMembershipChanged = false;

      for (const station of weatherStationsWithLatestData) {
        const stationId = station.station_id;
        activeStationIds.add(stationId);

        const nextObservationKey = stationLatestObservationKey(station.station_data);
        const existingEntry = markerRegistry.get(stationId);

        if (!existingEntry) {
          const marker = createWeatherStationMarker(station, (selectedMarker, selectedLocation) => {
            onWeatherStationMarkerClickRef.current(selectedMarker, selectedLocation);
          });
          markerRegistry.set(stationId, {
            marker,
            observationKey: nextObservationKey,
            location: station,
          });
          markerMembershipChanged = true;
          continue;
        }

        if (existingEntry.observationKey !== nextObservationKey) {
          updateWeatherStationMarker(existingEntry.marker, station);
          existingEntry.observationKey = nextObservationKey;
        }

        existingEntry.location = station;
      }

      for (const [stationId, entry] of markerRegistry.entries()) {
        if (activeStationIds.has(stationId)) continue;
        entry.marker.map = null;
        markerRegistry.delete(stationId);
        markerMembershipChanged = true;
      }

      if (markerMembershipChanged) {
        const nextMarkers = sortStationIds(Array.from(markerRegistry.keys())).map(stationId => {
          return markerRegistry.get(stationId)!.marker;
        });
        setWeatherStationMarkers(nextMarkers);
      }

      const openWeatherStationIdAtEnd = getOpenWeatherStationId?.() ?? null;
      const openEntryAtEnd = openWeatherStationIdAtEnd ? markerRegistry.get(openWeatherStationIdAtEnd) : null;
      const openObservationKeyBefore = openWeatherStationIdAtEnd
        ? observationKeysBeforeSync.get(openWeatherStationIdAtEnd)
        : undefined;
      const openObservationKeyAfter = openEntryAtEnd?.observationKey;
      const openStationObservationChanged =
        Boolean(openWeatherStationIdAtEnd) &&
        Boolean(openEntryAtEnd) &&
        openObservationKeyBefore !== openObservationKeyAfter;

      const nextOpenMarker = openEntryAtEnd?.marker ?? null;
      const markerWasRecreated =
        Boolean(openWeatherStationIdAtEnd) &&
        Boolean(previousOpenMarker) &&
        Boolean(nextOpenMarker) &&
        previousOpenMarker !== nextOpenMarker;
      const infoWindowOpen = Boolean(isInfoWindowOpen?.());
      const shouldRefreshOpenStationInfoWindow =
        Boolean(openWeatherStationIdAtEnd) &&
        Boolean(nextOpenMarker) &&
        infoWindowOpen &&
        Boolean(reopenWeatherStationInfoWindow) &&
        (markerWasRecreated || openStationObservationChanged);

      if (shouldRefreshOpenStationInfoWindow && nextOpenMarker && openWeatherStationIdAtEnd && openEntryAtEnd) {
        reopenWeatherStationInfoWindow?.(nextOpenMarker, openEntryAtEnd.location);
      }

      setMarkersError(null);
      hasLoadedInitialMarkers.current = true;
    } catch (err) {
      if (showLoading) {
        console.error('Error loading weather station markers:', err);
        setMarkersError(err instanceof Error ? err.message : 'Failed to load weather station markers');
      } else {
        // Only log the error - don't set a fatal error for background refresh failures.
        // The existing markers are still valid and displayed on the map.
        console.error('Error updating weather station markers with latest data:', err);
      }
    } finally {
      isLoadingRef.current = false;
      if (showLoading) {
        setIsLoadingMarkers(false);
      }
    }
  }, [getOpenWeatherStationId, isInfoWindowOpen, loadLatestWeatherStationData, reopenWeatherStationInfoWindow]);

  useEffect(() => {
    syncMarkersFromLatestDataRef.current = syncMarkersFromLatestData;
  }, [syncMarkersFromLatestData]);

  // Load markers on page load with a 2-second delay to prevent simultaneous database queries
  useEffect(() => {
    if (mapInstance && !hasLoadedInitialMarkers.current) {
      const timeoutId = setTimeout(() => {
        syncMarkersFromLatestData(true);
      }, 2000); // 2-second delay to allow paragliding locations to load first

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [mapInstance, syncMarkersFromLatestData]);

  // Load markers on page visibility change (with delay for mobile network recovery)
  useEffect(() => {
    if (isVisibleState && hasLoadedInitialMarkers.current) {
      // Small delay to allow mobile network to reconnect after page unfreeze
      const timeoutId = setTimeout(() => {
        syncMarkersFromLatestData(false);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [syncMarkersFromLatestData, isVisibleState]);

  // Set up 5-minute live updates starting at the next 5-minute mark
  useEffect(() => {
    if (mapInstance && weatherStationMarkers.length > 0) {
      const now = new Date();
      const currentMinutes = now.getMinutes();

      // Calculate minutes to next 5-minute mark (1, 6, 11, 16, etc.)
      const minutesToNext = 5 - (currentMinutes % 5) + 1;
      const delay = minutesToNext * 60 * 1000;

      const timeoutId = setTimeout(() => {
        syncMarkersFromLatestDataRef.current?.(false);

        // Now start the regular 5-minute interval
        intervalRef.current = setInterval(
          () => {
            // skip if tab is not in use
            if (!isVisibleRef.current) {
              return;
            }
            syncMarkersFromLatestDataRef.current?.(false);
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
  }, [mapInstance, weatherStationMarkers.length, isVisibleRef]);

  useEffect(() => {
    return () => {
      const markerRegistry = weatherStationMarkerRegistryRef.current;
      for (const entry of markerRegistry.values()) {
        entry.marker.map = null;
      }
      markerRegistry.clear();
    };
  }, []);

  return {
    weatherStationMarkers,
    isLoadingMarkers,
    markersError,
  };
};
