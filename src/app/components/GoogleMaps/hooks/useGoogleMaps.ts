import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useMarkers, useMarkerFiltering } from './markers';
import { useMapFilters } from './filters';
import { useMapControls, useOverlayManagement } from './controls';
import { getParaglidingInfoWindowAll, getParaglidingInfoWindowMain, getWeatherStationInfoWindowContent } from '../InfoWindows';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

interface UseGoogleMapsProps {
  variant: 'main' | 'all';
}

export const useGoogleMaps = ({ variant }: UseGoogleMapsProps) => {
  // Initialize map state
  const { mapState, updateFilters, updateMapPosition } = useMapState();

  // Initialize filters
  const filters = useMapFilters({
    initialShowParaglidingMarkers: mapState.showParaglidingMarkers,
    initialShowWeatherStationMarkers: mapState.showWeatherStationMarkers,
    initialSelectedWindDirections: mapState.selectedWindDirections,
    initialWindFilterAndOperator: mapState.windFilterAndOperator,
    initialPromisingFilter: mapState.promisingFilter,
    initialShowSkywaysLayer: mapState.showSkywaysLayer
  });

  // Initialize map controls
  const { infoWindowRef, closeInfoWindow, openInfoWindow } = useMapControls();

  // Initialize overlay management first (needed for map click handler)
  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded: filters.setWindFilterExpanded,
    setIsPromisingFilterExpanded: filters.setIsPromisingFilterExpanded,
    setIsFilterControlOpen: filters.setIsFilterControlOpen,
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
    showSkywaysLayer: filters.showSkywaysLayer,
    onMapPositionChange: useCallback((center: { lat: number; lng: number }, zoom: number) => {
      onMapPositionChangeRef.current(center, zoom);
    }, [])
  });

  // Handle marker click
  const handleMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => {
    if (!mapInstance) return;

    // Close any open overlays when opening an info window
    closeOverlays();

    if ('station_id' in location) {
      const content = getWeatherStationInfoWindowContent(location);
      openInfoWindow(mapInstance, marker, content);
    } else {
      const infoWindowContent = document.createElement('div');
      const root = createRoot(infoWindowContent);

      if (variant === 'all') {
        root.render(getParaglidingInfoWindowAll(location));
      } else {
        root.render(getParaglidingInfoWindowMain(location));
      }

      openInfoWindow(mapInstance, marker, infoWindowContent);
    }
  }, [mapInstance, openInfoWindow, closeOverlays, variant]);

  // Initialize markers based on variant
  const selectedMarkers = useMarkers({
    mapInstance,
    onMarkerClick: handleMarkerClick,
    dataSource: variant
  });

  // Initialize marker filtering
  const filteredMarkers = useMarkerFiltering({
    paraglidingMarkers: selectedMarkers.paraglidingMarkers,
    weatherStationMarkers: selectedMarkers.weatherStationMarkers || [],
    showParaglidingMarkers: filters.showParaglidingMarkers,
    showWeatherStationMarkers: filters.showWeatherStationMarkers,
    selectedWindDirections: filters.selectedWindDirections,
    windFilterAndOperator: filters.windFilterAndOperator,
    promisingFilter: variant === 'main' ? filters.promisingFilter : null
  });

  // Save state when filters change
  useEffect(() => {
    updateFilters({
      showParaglidingMarkers: filters.showParaglidingMarkers,
      showWeatherStationMarkers: filters.showWeatherStationMarkers,
      selectedWindDirections: filters.selectedWindDirections,
      windFilterAndOperator: filters.windFilterAndOperator,
      promisingFilter: filters.promisingFilter,
      showSkywaysLayer: filters.showSkywaysLayer
    });
  }, [
    filters.showParaglidingMarkers,
    filters.showWeatherStationMarkers,
    filters.selectedWindDirections,
    filters.windFilterAndOperator,
    filters.promisingFilter,
    filters.showSkywaysLayer,
    updateFilters
  ]);

  return {
    // Map instance
    mapRef,
    mapInstance,
    isLoading: isLoading || selectedMarkers.isLoadingMarkers,
    error: error || selectedMarkers.markersError || null,

    // Markers (use filtered markers for display)
    paraglidingMarkers: filteredMarkers.filteredParaglidingMarkers,
    weatherStationMarkers: filteredMarkers.filteredWeatherStationMarkers,
    userLocationMarker: (selectedMarkers as any).userLocationMarker || null,
    setUserLocationMarker: (selectedMarkers as any).setUserLocationMarker || (() => { }),

    // Filters
    ...filters,

    // Controls
    infoWindowRef,
    closeInfoWindow,
    closeOverlays,
  };
};
