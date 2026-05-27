import { useState, useCallback, useEffect, useRef } from 'react';
import { createWeatherStationMarker, updateWeatherStationMarker } from '../../MarkerSetup';
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
  getOpenWeatherStationId?: () => string | null;
  isInfoWindowOpen?: () => boolean;
}

type MarkerEntry = {
  marker: google.maps.marker.AdvancedMarkerElement;
  location: WeatherStationWithLatestData;
};

export const useWeatherStationMarkers = ({
  mapInstance,
  onWeatherStationMarkerClick,
  isMain,
  getOpenWeatherStationId,
  isInfoWindowOpen,
}: UseWeatherStationMarkersProps) => {
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadLatestWeatherStationData } = useWeatherStationData(isMain);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  const hasLoadedInitialMarkers = useRef<boolean>(false);
  const registryRef = useRef<Map<string, MarkerEntry>>(new Map());
  const onMarkerClickRef = useRef(onWeatherStationMarkerClick);
  const syncRef = useRef<(showLoading: boolean) => Promise<void>>(async () => {});
  const { isVisibleRef, isVisibleState } = usePageVisibility();

  useEffect(() => {
    onMarkerClickRef.current = onWeatherStationMarkerClick;
  }, [onWeatherStationMarkerClick]);

  const syncMarkers = useCallback(
    async (showLoading: boolean) => {
      if (isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;
        if (showLoading) {
          setIsLoadingMarkers(true);
          setMarkersError(null);
        }

        const stations = await loadLatestWeatherStationData();
        const registry = registryRef.current;
        const activeIds = new Set<string>();
        const updatedAtBefore = new Map<string, string>();
        for (const [stationId, entry] of registry.entries()) {
          updatedAtBefore.set(stationId, entry.location.station_data.updated_at);
        }

        let membershipChanged = false;

        for (const station of stations) {
          const stationId = station.station_id;
          activeIds.add(stationId);

          const existing = registry.get(stationId);
          if (!existing) {
            registry.set(stationId, {
              marker: createWeatherStationMarker(station, (marker, location) => {
                onMarkerClickRef.current(marker, location);
              }),
              location: station,
            });
            membershipChanged = true;
            continue;
          }

          if (existing.location.station_data.updated_at !== station.station_data.updated_at) {
            updateWeatherStationMarker(existing.marker, station);
          }
          existing.location = station;
        }

        for (const [stationId, entry] of registry.entries()) {
          if (activeIds.has(stationId)) continue;
          entry.marker.map = null;
          registry.delete(stationId);
          membershipChanged = true;
        }

        if (membershipChanged) {
          setWeatherStationMarkers(Array.from(registry.values(), entry => entry.marker));
        }

        const openStationId = getOpenWeatherStationId?.() ?? null;
        const openEntry = openStationId ? registry.get(openStationId) : null;
        if (
          openStationId &&
          openEntry &&
          isInfoWindowOpen?.() &&
          updatedAtBefore.get(openStationId) !== openEntry.location.station_data.updated_at
        ) {
          onMarkerClickRef.current(openEntry.marker, openEntry.location);
        }

        setMarkersError(null);
        hasLoadedInitialMarkers.current = true;
      } catch (err) {
        if (showLoading) {
          console.error('Error loading weather station markers:', err);
          setMarkersError(err instanceof Error ? err.message : 'Failed to load weather station markers');
        } else {
          console.error('Error updating weather station markers with latest data:', err);
        }
      } finally {
        isLoadingRef.current = false;
        if (showLoading) {
          setIsLoadingMarkers(false);
        }
      }
    },
    [getOpenWeatherStationId, isInfoWindowOpen, loadLatestWeatherStationData]
  );

  syncRef.current = syncMarkers;

  useEffect(() => {
    if (mapInstance && !hasLoadedInitialMarkers.current) {
      const timeoutId = setTimeout(() => syncRef.current(true), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [mapInstance]);

  useEffect(() => {
    if (isVisibleState && hasLoadedInitialMarkers.current) {
      const timeoutId = setTimeout(() => syncRef.current(false), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isVisibleState]);

  useEffect(() => {
    if (!mapInstance || weatherStationMarkers.length === 0) return;

    const now = new Date();
    const minutesToNext = 5 - (now.getMinutes() % 5) + 1;
    const delay = minutesToNext * 60 * 1000;

    const timeoutId = setTimeout(() => {
      syncRef.current(false);
      intervalRef.current = setInterval(() => {
        if (isVisibleRef.current) {
          syncRef.current(false);
        }
      }, 5 * 60 * 1000);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mapInstance, weatherStationMarkers.length, isVisibleRef]);

  return {
    weatherStationMarkers,
    isLoadingMarkers,
    markersError,
  };
};
