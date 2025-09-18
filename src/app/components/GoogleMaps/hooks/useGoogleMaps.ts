import { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useWeatherStationMarkers, useParaglidingMarkers, useMarkerFiltering } from './markers';
import { useMapFilters } from './filters';
import { useInfoWindows, useOverlayManagement } from './controls';
import { getParaglidingInfoWindow, getAllStartsInfoWindow, getWeatherStationInfoWindow } from '../InfoWindows';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

type Variant = 'main' | 'all';

interface UseGoogleMapsProps {
  variant: Variant;
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
    initialPromisingFilter: variant === 'main' ? mapState.promisingFilter : null,
    initialShowSkywaysLayer: mapState.showSkywaysLayer
  });

  // Initialize map controls
  const { infoWindowRef, closeInfoWindow, openInfoWindow } = useInfoWindows();

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
      const infoWindowContent = document.createElement('div');
      const root = createRoot(infoWindowContent);
      root.render(getWeatherStationInfoWindow(location));
      openInfoWindow(mapInstance, marker, infoWindowContent);
    } else {
      const infoWindowContent = document.createElement('div');
      const root = createRoot(infoWindowContent);
      root.render(variant === 'main'
        ? getParaglidingInfoWindow(location)
        : getAllStartsInfoWindow(location)
      );
      openInfoWindow(mapInstance, marker, infoWindowContent);
    }
  }, [mapInstance, openInfoWindow, closeOverlays, variant]);

  // Initialize markers
  const {
    weatherStationMarkers,
    isLoadingMarkers: isLoadingWeatherStationMarkers,
    markersError: markersErrorWeatherStationMarkers
  } = useWeatherStationMarkers({
    mapInstance,
    onMarkerClick: handleMarkerClick
  });

  const { paraglidingMarkers,
    isLoadingMarkers: isLoadingParaglidingMarkers,
    markersError: markersErrorParaglidingMarkers
  } = useParaglidingMarkers({
    mapInstance,
    onMarkerClick: handleMarkerClick,
    variant
  });

  // Initialize marker filtering
  const filteredMarkers = useMarkerFiltering({
    paraglidingMarkers: paraglidingMarkers,
    weatherStationMarkers: weatherStationMarkers,
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
      promisingFilter: variant === 'main' ? filters.promisingFilter : null,
      showSkywaysLayer: filters.showSkywaysLayer
    });
  }, [
    filters.showParaglidingMarkers,
    filters.showWeatherStationMarkers,
    filters.selectedWindDirections,
    filters.windFilterAndOperator,
    filters.promisingFilter,
    filters.showSkywaysLayer,
    variant,
    updateFilters
  ]);

  return {
    // Map instance
    mapRef,
    mapInstance,
    isLoading: isLoading || isLoadingParaglidingMarkers || isLoadingWeatherStationMarkers,
    error: error || markersErrorParaglidingMarkers || markersErrorWeatherStationMarkers,

    // Filtered markers
    paraglidingMarkers: filteredMarkers.filteredParaglidingMarkers,
    weatherStationMarkers: filteredMarkers.filteredWeatherStationMarkers,

    // Filters
    ...filters,

    // Controls
    infoWindowRef,
    closeInfoWindow,
    closeOverlays
  };
};
