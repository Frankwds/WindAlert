import { useState, useCallback, useEffect, useRef } from 'react';
import { createParaglidingMarkers, createLandingMarker } from '../../MarkerSetup';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { useParaglidingData } from '../data/useParaglidingData';

type Variant = 'main' | 'all';

const MARKER_RETRY_DELAY_MS = 3000;

interface UseParaglidingLocationsAndLandingsProps {
  mapInstance: google.maps.Map | null;
  onParaglidingMarkerClick: (
    marker: google.maps.marker.AdvancedMarkerElement,
    location: ParaglidingLocationWithForecast
  ) => void;
  onLandingMarkerClick: (
    marker: google.maps.marker.AdvancedMarkerElement,
    location: ParaglidingLocationWithForecast
  ) => void;
  variant: Variant;
}

export const useParaglidingLocationsAndLandings = ({
  mapInstance,
  onParaglidingMarkerClick,
  onLandingMarkerClick,
  variant,
}: UseParaglidingLocationsAndLandingsProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [landingMarkers, setLandingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadMarkersRef = useRef<() => Promise<void>>(async () => {});

  const { loadParaglidingData } = useParaglidingData({ variant });

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const scheduleRetry = useCallback(() => {
    clearRetryTimeout();
    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null;
      void loadMarkersRef.current();
    }, MARKER_RETRY_DELAY_MS);
  }, [clearRetryTimeout]);

  const loadMarkers = useCallback(async () => {
    if (!mapInstance || isLoadingRef.current || hasLoadedRef.current) return;

    clearRetryTimeout();

    try {
      isLoadingRef.current = true;
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const paraglidingLocations = await loadParaglidingData();

      const paraglidingMarkersArray = createParaglidingMarkers(paraglidingLocations, onParaglidingMarkerClick);
      setParaglidingMarkers(paraglidingMarkersArray);

      const locationsWithLandings = paraglidingLocations.filter(
        location => location.landing_latitude && location.landing_longitude
      );

      const landingMarkersArray = locationsWithLandings.map(location => {
        const marker = createLandingMarker(location);

        const markerElement = marker.content as HTMLElement;
        markerElement.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          onLandingMarkerClick(marker, location);
        });

        return marker;
      });

      setLandingMarkers(landingMarkersArray);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error('Error loading paragliding and landing markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load paragliding and landing markers');
      scheduleRetry();
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMarkers(false);
    }
  }, [
    mapInstance,
    loadParaglidingData,
    onParaglidingMarkerClick,
    onLandingMarkerClick,
    clearRetryTimeout,
    scheduleRetry,
  ]);

  loadMarkersRef.current = loadMarkers;

  useEffect(() => {
    if (!mapInstance || hasLoadedRef.current) return;
    void loadMarkers();

    return () => {
      clearRetryTimeout();
    };
  }, [mapInstance, loadMarkers, clearRetryTimeout]);

  return {
    paraglidingMarkers,
    landingMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError,
  };
};
