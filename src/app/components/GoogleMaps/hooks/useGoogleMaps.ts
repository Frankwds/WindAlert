import { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useWeatherStationMarkers, useParaglidingMarkers, useMarkerFiltering, useLandingMarker } from './markers';
import { useMapFilters } from './filters';
import { useInfoWindows, useOverlayManagement } from './controls';
import { getMainParaglidingInfoWindow, getAllParaglidingInfoWindow, getWeatherStationInfoWindow, getLandingInfoWindow } from '../InfoWindows';
import { ParaglidingLocationWithForecast, WeatherStationWithData } from '@/lib/supabase/types';

type Variant = 'main' | 'all';

interface UseGoogleMapsProps {
  variant: Variant;
}

export const useGoogleMaps = ({ variant }: UseGoogleMapsProps) => {
  const { mapState, updateFilters, updateMapPosition, updateMapType } = useMapState();

  const filters = useMapFilters({
    initialShowParaglidingMarkers: mapState.showParaglidingMarkers,
    initialShowWeatherStationMarkers: mapState.showWeatherStationMarkers,
    initialSelectedWindDirections: mapState.selectedWindDirections,
    initialWindFilterAndOperator: mapState.windFilterAndOperator,
    initialPromisingFilter: variant === 'main' ? mapState.promisingFilter : null,
    initialShowSkywaysLayer: mapState.showSkywaysLayer,
    initialShowThermalsLayer: mapState.showThermalsLayer
  });

  const { infoWindowRef, closeInfoWindow, openInfoWindow } = useInfoWindows();

  // Create a ref for closeOverlays to avoid circular dependency
  const closeOverlaysRef = useRef<() => void>(() => { });

  // Ref to track when we're in the middle of a paragliding marker click to not clear the landing marker on filter changes
  const isParaglidingMarkerClickRef = useRef(false);

  const onMapReadyRef = useRef<(map: google.maps.Map) => void>(() => { });
  const onMapClickRef = useRef<() => void>(() => { });
  const onMapPositionChangeRef = useRef(updateMapPosition);

  useEffect(() => {
    onMapClickRef.current = () => closeOverlaysRef.current();
  }, []);

  useEffect(() => {
    onMapPositionChangeRef.current = updateMapPosition;
  }, [updateMapPosition]);

  const initialMapState = useMemo(() => ({
    center: mapState.center,
    zoom: mapState.zoom
  }), []);


  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    initialMapState,
    onMapReady: useCallback((map) => {
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow();
      }
      onMapReadyRef.current(map);
    }, [infoWindowRef]),
    onMapClick: useCallback(() => {
      onMapClickRef.current();
    }, []),
    showSkywaysLayer: filters.showSkywaysLayer,
    showThermalsLayer: filters.showThermalsLayer,
    onMapPositionChange: useCallback((center: { lat: number; lng: number }, zoom: number) => {
      onMapPositionChangeRef.current(center, zoom);
    }, []),
    initialMapType: mapState.mapType
  });

  const onWeatherStationMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationWithData) => {
    if (!mapInstance) return;

    closeOverlaysRef.current();

    const infoWindowContent = document.createElement('div');
    const root = createRoot(infoWindowContent);
    root.render(getWeatherStationInfoWindow(location));
    openInfoWindow(mapInstance, marker, infoWindowContent);
  }, [mapInstance, openInfoWindow]);

  const onLandingMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => {
    if (!mapInstance) return;

    closeOverlaysRef.current();

    const infoWindowContent = document.createElement('div');
    const root = createRoot(infoWindowContent);
    root.render(getLandingInfoWindow(location));
    openInfoWindow(mapInstance, marker, infoWindowContent);
  }, [mapInstance, openInfoWindow]);

  const { currentLandingMarker, clearLandingMarker, showLandingMarker } = useLandingMarker({
    mapInstance,
    onLandingMarkerClick
  });

  const onParaglidingMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => {
    if (!mapInstance) return;

    // Set flag to prevent filter change effects from clearing landing marker
    isParaglidingMarkerClickRef.current = true;

    closeOverlaysRef.current();

    // Always clear existing landing marker first
    clearLandingMarker();

    // Handle landing marker - check if both landing coordinates exist
    if (location.landing_latitude && location.landing_longitude) {
      // Pass paragliding marker position to showLandingMarker
      const paraglidingPosition = marker.position;
      if (paraglidingPosition) {
        // Convert LatLng to simple lat/lng object
        const position = {
          lat: typeof paraglidingPosition.lat === 'function' ? paraglidingPosition.lat() : paraglidingPosition.lat,
          lng: typeof paraglidingPosition.lng === 'function' ? paraglidingPosition.lng() : paraglidingPosition.lng
        };
        showLandingMarker(location, position);
      }
    }

    const infoWindowContent = document.createElement('div');
    const root = createRoot(infoWindowContent);
    root.render(variant === 'main'
      ? getMainParaglidingInfoWindow(location)
      : getAllParaglidingInfoWindow(location)
    );
    openInfoWindow(mapInstance, marker, infoWindowContent);

    // Reset flag after a short delay to allow the landing marker to be set
    setTimeout(() => {
      isParaglidingMarkerClickRef.current = false;
    }, 100);
  }, [mapInstance, openInfoWindow, variant, showLandingMarker, clearLandingMarker]);

  const {
    weatherStationMarkers,
    isLoadingMarkers: isLoadingWeatherStationMarkers,
    markersError: markersErrorWeatherStationMarkers
  } = useWeatherStationMarkers({
    mapInstance,
    onWeatherStationMarkerClick,
    isMain: variant === 'main'
  });

  const { paraglidingMarkers,
    isLoadingMarkers: isLoadingParaglidingMarkers,
    markersError: markersErrorParaglidingMarkers
  } = useParaglidingMarkers({
    mapInstance,
    onParaglidingMarkerClick,
    variant
  });

  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded: filters.setWindFilterExpanded,
    setIsPromisingFilterExpanded: filters.setIsPromisingFilterExpanded,
    setIsFilterControlOpen: filters.setIsFilterControlOpen,
    closeInfoWindow
  });

  // Update the ref with the actual closeOverlays function
  useEffect(() => {
    closeOverlaysRef.current = closeOverlays;
  }, [closeOverlays]);

  // Clear landing marker when filter controls change
  useEffect(() => {
    if (!isParaglidingMarkerClickRef.current) {
      clearLandingMarker();
    }
  }, [filters.isFilterControlOpen, clearLandingMarker]);

  // Clear landing marker when wind filter changes
  useEffect(() => {
    if (!isParaglidingMarkerClickRef.current) {
      clearLandingMarker();
    }
  }, [filters.windFilterExpanded, clearLandingMarker]);

  // Clear landing marker when promising filter changes
  useEffect(() => {
    if (!isParaglidingMarkerClickRef.current) {
      clearLandingMarker();
    }
  }, [filters.isPromisingFilterExpanded, clearLandingMarker]);

  const filteredMarkers = useMarkerFiltering({
    paraglidingMarkers: paraglidingMarkers,
    weatherStationMarkers: weatherStationMarkers,
    showParaglidingMarkers: filters.showParaglidingMarkers,
    showWeatherStationMarkers: filters.showWeatherStationMarkers,
    selectedWindDirections: filters.selectedWindDirections,
    windFilterAndOperator: filters.windFilterAndOperator,
    promisingFilter: variant === 'main' ? filters.promisingFilter : null
  });

  useEffect(() => {
    updateFilters({
      showParaglidingMarkers: filters.showParaglidingMarkers,
      showWeatherStationMarkers: filters.showWeatherStationMarkers,
      selectedWindDirections: filters.selectedWindDirections,
      windFilterAndOperator: filters.windFilterAndOperator,
      promisingFilter: variant === 'main' ? filters.promisingFilter : null,
      showSkywaysLayer: filters.showSkywaysLayer,
      showThermalsLayer: filters.showThermalsLayer
    });
  }, [
    filters.showParaglidingMarkers,
    filters.showWeatherStationMarkers,
    filters.selectedWindDirections,
    filters.windFilterAndOperator,
    filters.promisingFilter,
    filters.showSkywaysLayer,
    filters.showThermalsLayer,
    variant,
    updateFilters
  ]);

  const handleMapTypeChange = useCallback((mapType: 'terrain' | 'satellite' | 'osm') => {
    updateMapType(mapType);
  }, [updateMapType]);

  return {

    mapRef,
    mapInstance,
    isLoading: isLoading || isLoadingParaglidingMarkers || isLoadingWeatherStationMarkers,
    error: error || markersErrorParaglidingMarkers || markersErrorWeatherStationMarkers,


    paraglidingMarkers: filteredMarkers.filteredParaglidingMarkers,
    weatherStationMarkers: filteredMarkers.filteredWeatherStationMarkers,


    ...filters,

    // Map type state
    mapType: mapState.mapType,
    onMapTypeChange: handleMapTypeChange,

    infoWindowRef,
    closeInfoWindow,
    closeOverlays,
    currentLandingMarker,
    clearLandingMarker,
    showLandingMarker
  };
};
