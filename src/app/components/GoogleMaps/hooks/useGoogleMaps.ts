import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useOpenAnchorInfoWindowWithTerrainCoordination } from './openAnchorInfoWindowWithTerrainCoordination';
import { useMapInstance, useMapState } from './map';
import {
  useWeatherStationMarkers,
  useMarkerFiltering,
  useLandingMarker,
  useParaglidingLocationsAndLandings,
} from './markers';
import { useMapFilters } from './filters';
import { useInfoWindows, useOverlayManagement, useMapClickLinksInteraction } from './controls';
import {
  getMainParaglidingInfoWindow,
  getAllParaglidingInfoWindow,
  getWeatherStationInfoWindow,
  getLandingInfoWindow,
} from '../InfoWindows';
import { ParaglidingLocationWithForecast, WeatherStationWithLatestData } from '@/lib/supabase/types';

type Variant = 'main' | 'all';

interface UseGoogleMapsProps {
  variant: Variant;
}

export const useGoogleMaps = ({ variant }: UseGoogleMapsProps) => {
  const { mapState, updateFilters, updateMapPosition, updateMapType } = useMapState();

  const filters = useMapFilters({
    initialShowParaglidingMarkers: mapState.showParaglidingMarkers,
    initialShowWeatherStationMarkers: mapState.showWeatherStationMarkers,
    initialShowLandingsLayer: mapState.showLandingsLayer,
    initialSelectedWindDirections: mapState.selectedWindDirections,
    initialWindFilterAndOperator: mapState.windFilterAndOperator,
    initialPromisingFilter: variant === 'main' ? mapState.promisingFilter : null,
    initialShowSkywaysLayer: mapState.showSkywaysLayer,
    initialShowThermalsLayer: mapState.showThermalsLayer,
  });

  const { infoWindowRef, closeInfoWindow, isInfoWindowOpen, openInfoWindow } = useInfoWindows();

  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded: filters.setWindFilterExpanded,
    setIsPromisingFilterExpanded: filters.setIsPromisingFilterExpanded,
    setIsFilterControlOpen: filters.setIsFilterControlOpen,
    closeInfoWindow,
  });

  const filterOverlaysOpen = useMemo(
    () =>
      filters.windFilterExpanded || filters.isPromisingFilterExpanded || filters.isFilterControlOpen,
    [filters.windFilterExpanded, filters.isPromisingFilterExpanded, filters.isFilterControlOpen]
  );

  // Ref to track when we're in the middle of a paragliding marker click to not clear the landing marker on filter changes
  const isParaglidingMarkerClickRef = useRef(false);

  const onMapPositionChangeRef = useRef(updateMapPosition);

  useEffect(() => {
    onMapPositionChangeRef.current = updateMapPosition;
  }, [updateMapPosition]);

  const initialMapState = useMemo(
    () => ({
      center: mapState.center,
      zoom: mapState.zoom,
    }),
    []
  );

  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    initialMapState,
    onMapReady: useCallback((_map: google.maps.Map) => {
      if (!infoWindowRef.current) {
        infoWindowRef.current = new google.maps.InfoWindow();
      }
    }, [infoWindowRef]),
    showSkywaysLayer: filters.showSkywaysLayer,
    showThermalsLayer: filters.showThermalsLayer,
    onMapPositionChange: useCallback((center: { lat: number; lng: number }, zoom: number) => {
      onMapPositionChangeRef.current(center, zoom);
    }, []),
    initialMapType: mapState.mapType,
  });

  const { clearPendingTerrainTap, markMarkerInfoWindowOpened } = useMapClickLinksInteraction({
    mapInstance,
    overlaysOpen: filterOverlaysOpen,
    closeOverlays,
    openInfoWindow,
    isInfoWindowOpen,
  });

  const openAnchorInfoWindow = useOpenAnchorInfoWindowWithTerrainCoordination({
    mapInstance,
    clearPendingTerrainTap,
    closeOverlays,
    openInfoWindow,
    markMarkerInfoWindowOpened,
  });

  const onWeatherStationMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationWithLatestData) => {
      openAnchorInfoWindow(marker, getWeatherStationInfoWindow(location));
    },
    [openAnchorInfoWindow]
  );

  const onLandingMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => {
      openAnchorInfoWindow(marker, getLandingInfoWindow(location));
    },
    [openAnchorInfoWindow]
  );

  const { currentLandingMarker, clearLandingMarker, showLandingMarker } = useLandingMarker({
    mapInstance,
    onLandingMarkerClick,
  });

  const onParaglidingMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => {
      if (!mapInstance) return;

      clearPendingTerrainTap();

      // Set flag to prevent filter change effects from clearing landing marker
      isParaglidingMarkerClickRef.current = true;

      closeOverlays();

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
            lng: typeof paraglidingPosition.lng === 'function' ? paraglidingPosition.lng() : paraglidingPosition.lng,
          };
          showLandingMarker(location, position);
        }
      }

      openAnchorInfoWindow(
        marker,
        variant === 'main' ? getMainParaglidingInfoWindow(location) : getAllParaglidingInfoWindow(location),
        { closeFilterOverlays: false }
      );

      setTimeout(() => {
        // Reset flag after a short delay to allow the landing marker to be set
        isParaglidingMarkerClickRef.current = false;
      }, 100);
    },
    [mapInstance, variant, showLandingMarker, clearLandingMarker, closeOverlays, openAnchorInfoWindow]
  );

  const {
    weatherStationMarkers,
    isLoadingMarkers: isLoadingWeatherStationMarkers,
    markersError: markersErrorWeatherStationMarkers,
  } = useWeatherStationMarkers({
    mapInstance,
    onWeatherStationMarkerClick,
    isMain: variant === 'main',
  });

  const {
    paraglidingMarkers,
    landingMarkers,
    isLoadingMarkers: isLoadingParaglidingAndLandingMarkers,
    markersError: markersErrorParaglidingAndLandingMarkers,
  } = useParaglidingLocationsAndLandings({
    mapInstance,
    onParaglidingMarkerClick,
    onLandingMarkerClick,
    variant,
  });

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
    landingMarkers: landingMarkers,
    showParaglidingMarkers: filters.showParaglidingMarkers,
    showWeatherStationMarkers: filters.showWeatherStationMarkers,
    showLandingsLayer: filters.showLandingsLayer,
    selectedWindDirections: filters.selectedWindDirections,
    windFilterAndOperator: filters.windFilterAndOperator,
    promisingFilter: variant === 'main' ? filters.promisingFilter : null,
  });

  useEffect(() => {
    updateFilters({
      showParaglidingMarkers: filters.showParaglidingMarkers,
      showWeatherStationMarkers: filters.showWeatherStationMarkers,
      showLandingsLayer: filters.showLandingsLayer,
      selectedWindDirections: filters.selectedWindDirections,
      windFilterAndOperator: filters.windFilterAndOperator,
      promisingFilter: variant === 'main' ? filters.promisingFilter : null,
      showSkywaysLayer: filters.showSkywaysLayer,
      showThermalsLayer: filters.showThermalsLayer,
    });
  }, [
    filters.showParaglidingMarkers,
    filters.showWeatherStationMarkers,
    filters.showLandingsLayer,
    filters.selectedWindDirections,
    filters.windFilterAndOperator,
    filters.promisingFilter,
    filters.showSkywaysLayer,
    filters.showThermalsLayer,
    variant,
    updateFilters,
  ]);

  const handleMapTypeChange = useCallback(
    (mapType: 'terrain' | 'satellite' | 'osm') => {
      updateMapType(mapType);
    },
    [updateMapType]
  );

  return {
    mapRef,
    mapInstance,
    isLoading: isLoading,
    error: error || markersErrorParaglidingAndLandingMarkers || markersErrorWeatherStationMarkers,

    // Individual marker loading states
    isLoadingParaglidingMarkers: isLoadingParaglidingAndLandingMarkers,
    isLoadingWeatherStationMarkers: isLoadingWeatherStationMarkers,

    paraglidingMarkers: filteredMarkers.filteredParaglidingMarkers,
    weatherStationMarkers: filteredMarkers.filteredWeatherStationMarkers,
    landingMarkers: filteredMarkers.filteredLandingMarkers,

    ...filters,

    // Map type state
    mapType: mapState.mapType,
    onMapTypeChange: handleMapTypeChange,

    infoWindowRef,
    closeInfoWindow,
    closeOverlays,
    currentLandingMarker,
    clearLandingMarker,
    showLandingMarker,
  };
};
