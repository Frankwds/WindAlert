import { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useAllMarkers } from './markers/useAllMarkers';
import { useMapControls, useOverlayManagement } from './controls';
import { getParaglidingInfoWindow } from '../InfoWindows';
import { ParaglidingMarkerData } from '@/lib/supabase/types';

export const useGoogleMapsAll = () => {
  // Initialize map state (simplified - no filters needed)
  const { mapState, updateMapPosition } = useMapState();

  // Initialize map controls
  const { infoWindowRef, closeInfoWindow, openInfoWindow } = useMapControls();

  // Initialize overlay management (simplified - only for closing overlays)
  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded: () => { }, // No wind filter
    setIsPromisingFilterExpanded: () => { }, // No promising filter
    setIsFilterControlOpen: () => { }, // No filter control
    closeInfoWindow
  });

  // Create stable callbacks using refs
  const onMapReadyRef = useRef<(map: google.maps.Map) => void>(() => { });
  const onMapClickRef = useRef<() => void>(() => { });
  const onMapPositionChangeRef = useRef(updateMapPosition);

  // Update refs when functions change
  useEffect(() => {
    onMapClickRef.current = closeOverlays;
  }, [closeOverlays]);

  useEffect(() => {
    onMapPositionChangeRef.current = updateMapPosition;
  }, [updateMapPosition]);

  // Memoize initial map state to prevent unnecessary re-renders
  const initialMapState = useMemo(() => ({
    center: mapState.center,
    zoom: mapState.zoom
  }), []); // Empty dependency array - only use initial state once

  // Initialize map instance
  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    initialMapState,
    onMapReady: useCallback((map) => {
      // Initialize the InfoWindow when map is ready
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow();
      }
      onMapReadyRef.current(map);
    }, []),
    onMapClick: useCallback(() => {
      onMapClickRef.current();
    }, []),
    showSkywaysLayer: false, // No skyways layer for all locations
    onMapPositionChange: useCallback((center: { lat: number; lng: number }, zoom: number) => {
      onMapPositionChangeRef.current(center, zoom);
    }, [])
  });

  // Handle marker click
  const handleMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData) => {
    if (!mapInstance) return;

    // Close any open overlays when opening an info window
    closeOverlays();

    const infoWindowContent = document.createElement('div');
    const root = createRoot(infoWindowContent);
    root.render(getParaglidingInfoWindow(location));
    openInfoWindow(mapInstance, marker, infoWindowContent);
  }, [mapInstance, openInfoWindow, closeOverlays]);

  // Initialize all markers (no filtering)
  const markers = useAllMarkers({
    mapInstance,
    onMarkerClick: handleMarkerClick
  });

  return {
    // Map instance
    mapRef,
    mapInstance,
    isLoading: isLoading || markers.isLoading,
    error: error || markers.error,

    // Markers (all paragliding locations, no filtering)
    paraglidingMarkers: markers.paraglidingMarkers,

    // Controls
    infoWindowRef,
    closeInfoWindow,
    closeOverlays
  };
};
