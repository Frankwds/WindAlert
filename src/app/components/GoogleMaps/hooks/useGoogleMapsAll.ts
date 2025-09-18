import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useAllMarkers } from './markers/useAllMarkers';
import { useMarkerFiltering } from './markers/useMarkerFiltering';
import { useMapFilters } from './filters/useMapFilters';
import { useInfoWindows, useOverlayManagement } from './controls';
import { LocationCardAll } from '../../LocationCards';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import { getWeatherStationInfoWindow } from '../InfoWindows';

export const useGoogleMapsAll = () => {
  // Initialize map state
  const { mapState, updateMapPosition, updateFilters } = useMapState();

  // Initialize map filters (with all filter options for all locations)
  const {
    showParaglidingMarkers,
    showWeatherStationMarkers,
    selectedWindDirections,
    windFilterExpanded,
    windFilterAndOperator,
    isFilterControlOpen,
    showSkywaysLayer,
    setShowParaglidingMarkers,
    setShowWeatherStationMarkers,
    setWindFilterExpanded,
    setIsFilterControlOpen,
    setShowSkywaysLayer,
    handleWindDirectionChange,
    handleWindFilterLogicChange
  } = useMapFilters({
    initialShowParaglidingMarkers: mapState.showParaglidingMarkers,
    initialShowWeatherStationMarkers: mapState.showWeatherStationMarkers,
    initialSelectedWindDirections: mapState.selectedWindDirections,
    initialWindFilterAndOperator: mapState.windFilterAndOperator,
    initialPromisingFilter: null, // No promising filter for all locations
    initialShowSkywaysLayer: mapState.showSkywaysLayer
  });

  // Initialize map controls
  const { infoWindowRef, closeInfoWindow, openInfoWindow } = useInfoWindows();

  // Initialize overlay management
  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded,
    setIsPromisingFilterExpanded: () => { }, // No promising filter
    setIsFilterControlOpen,
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
    showSkywaysLayer: showSkywaysLayer,
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
      // Weather station marker
      const infoWindowContent = document.createElement('div');
      const root = createRoot(infoWindowContent);
      root.render(getWeatherStationInfoWindow(location));
      openInfoWindow(mapInstance, marker, infoWindowContent);
    } else {
      // Paragliding location marker
      const infoWindowContent = document.createElement('div');
      const root = createRoot(infoWindowContent);
      root.render(React.createElement(LocationCardAll, { location }));
      openInfoWindow(mapInstance, marker, infoWindowContent);
    }
  }, [mapInstance, openInfoWindow, closeOverlays]);

  // Initialize all markers (paragliding locations and weather stations)
  const allMarkers = useAllMarkers({
    mapInstance,
    onMarkerClick: handleMarkerClick
  });

  // Apply filtering to all markers
  const { filteredParaglidingMarkers, filteredWeatherStationMarkers } = useMarkerFiltering({
    paraglidingMarkers: allMarkers.paraglidingMarkers,
    weatherStationMarkers: allMarkers.weatherStationMarkers,
    showParaglidingMarkers,
    showWeatherStationMarkers,
    selectedWindDirections,
    windFilterAndOperator,
    promisingFilter: null // No promising filter for all locations
  });

  // Save state when filters change
  useEffect(() => {
    updateFilters({
      showParaglidingMarkers,
      showWeatherStationMarkers,
      selectedWindDirections,
      windFilterAndOperator,
      promisingFilter: null, // No promising filter for all locations
      showSkywaysLayer
    });
  }, [
    showParaglidingMarkers,
    showWeatherStationMarkers,
    selectedWindDirections,
    windFilterAndOperator,
    showSkywaysLayer,
    updateFilters
  ]);

  return {
    // Map instance
    mapRef,
    mapInstance,
    isLoading: isLoading || allMarkers.isLoading,
    error: error || allMarkers.error,

    // Markers (filtered)
    paraglidingMarkers: filteredParaglidingMarkers,
    weatherStationMarkers: filteredWeatherStationMarkers,

    // Filter state
    showParaglidingMarkers,
    showWeatherStationMarkers,
    selectedWindDirections,
    windFilterExpanded,
    windFilterAndOperator,
    isFilterControlOpen,
    showSkywaysLayer,
    setShowParaglidingMarkers,
    setShowWeatherStationMarkers,
    setWindFilterExpanded,
    setIsFilterControlOpen,
    setShowSkywaysLayer,
    handleWindDirectionChange,
    handleWindFilterLogicChange,

    // Controls
    infoWindowRef,
    closeInfoWindow,
    closeOverlays
  };
};
