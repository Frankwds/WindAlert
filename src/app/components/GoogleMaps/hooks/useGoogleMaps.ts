import { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useMarkers, useMarkerFiltering } from './markers';
import { useMapFilters } from './filters';
import { useMapControls, useOverlayManagement } from './controls';
import { getParaglidingInfoWindow, getWeatherStationInfoWindowContent } from '../InfoWindows';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

interface UseGoogleMapsProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export const useGoogleMaps = ({ isFullscreen, toggleFullscreen }: UseGoogleMapsProps) => {
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
  const { mapRef, mapInstance, isLoading, error, createSkywaysLayer } = useMapInstance({
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
      root.render(getParaglidingInfoWindow(location));
      openInfoWindow(mapInstance, marker, infoWindowContent);
    }
  }, [mapInstance, openInfoWindow, closeOverlays]);

  // Initialize markers
  const markers = useMarkers({
    mapInstance,
    onMarkerClick: handleMarkerClick
  });

  // Initialize marker filtering
  const filteredMarkers = useMarkerFiltering({
    paraglidingMarkers: markers.paraglidingMarkers,
    weatherStationMarkers: markers.weatherStationMarkers,
    showParaglidingMarkers: filters.showParaglidingMarkers,
    showWeatherStationMarkers: filters.showWeatherStationMarkers,
    selectedWindDirections: filters.selectedWindDirections,
    windFilterAndOperator: filters.windFilterAndOperator,
    promisingFilter: filters.promisingFilter
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
    isLoading,
    error,
    createSkywaysLayer,

    // Markers
    paraglidingMarkers: markers.paraglidingMarkers,
    weatherStationMarkers: markers.weatherStationMarkers,
    userLocationMarker: markers.userLocationMarker,
    setUserLocationMarker: markers.setUserLocationMarker,

    // Filtered markers
    filteredParaglidingMarkers: filteredMarkers.filteredParaglidingMarkers,
    filteredWeatherStationMarkers: filteredMarkers.filteredWeatherStationMarkers,

    // Filters
    ...filters,

    // Controls
    infoWindowRef,
    closeInfoWindow,
    closeOverlays,

    // Props
    isFullscreen,
    toggleFullscreen
  };
};
