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
import {
  useInfoWindows,
  useOverlayManagement,
  useMapClickLinksInteraction,
  InfoWindowWithWeatherStationId,
} from './controls';
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

/**
 * Lets paragliding marker handling (landing marker, overlays) finish before filter-change effects
 * may clear the landing marker. Not coupled to terrain tap timings in `useMapClickLinksInteraction`.
 */
const PARAGLIDING_CLICK_FLAG_RESET_MS = 100;

export const useGoogleMaps = ({ variant }: UseGoogleMapsProps) => {
  // --- Map position / persisted filter state
  const { mapState, updateFilters, updateMapPosition, updateMapType } = useMapState();

  // --- Local filter UI state (wind, promising, control panel, layers)
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

  // --- Shared InfoWindow + overlay stack
  const { infoWindowRef, closeInfoWindow, isInfoWindowOpen, openInfoWindow } = useInfoWindows();
  const openWeatherStationIdRef = useRef<string | null>(null);

  const clearOpenWeatherStationTracking = useCallback(() => {
    openWeatherStationIdRef.current = null;
    const infoWindow = infoWindowRef.current as InfoWindowWithWeatherStationId | null;
    if (infoWindow) {
      delete infoWindow.__weatherStationId;
    }
  }, [infoWindowRef]);

  const closeInfoWindowAndClearOpenWeatherStation = useCallback(() => {
    clearOpenWeatherStationTracking();
    closeInfoWindow();
  }, [clearOpenWeatherStationTracking, closeInfoWindow]);

  const getOpenWeatherStationId = useCallback(() => {
    return (
      openWeatherStationIdRef.current ??
      (infoWindowRef.current as InfoWindowWithWeatherStationId | null)?.__weatherStationId ??
      null
    );
  }, [infoWindowRef]);

  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded: filters.setWindFilterExpanded,
    setIsPromisingFilterExpanded: filters.setIsPromisingFilterExpanded,
    setIsFilterControlOpen: filters.setIsFilterControlOpen,
    closeInfoWindow: closeInfoWindowAndClearOpenWeatherStation,
  });

  const filterOverlaysOpen = useMemo(
    () =>
      filters.windFilterExpanded || filters.isPromisingFilterExpanded || filters.isFilterControlOpen,
    [filters.windFilterExpanded, filters.isPromisingFilterExpanded, filters.isFilterControlOpen]
  );

  // --- Paragliding click guard (see PARAGLIDING_CLICK_FLAG_RESET_MS)
  const isParaglidingMarkerClickRef = useRef(false);

  const onMapPositionChangeRef = useRef(updateMapPosition);

  useEffect(() => {
    onMapPositionChangeRef.current = updateMapPosition;
  }, [updateMapPosition]);

  // --- Loader: Map instance, skyways/thermals, position persistence
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

  // --- Terrain background tap + marker / overlay coordination
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

  // --- Marker click handlers (delegate to openAnchorInfoWindow)
  const onWeatherStationMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationWithLatestData) => {
      openAnchorInfoWindow(marker, getWeatherStationInfoWindow(location));
      openWeatherStationIdRef.current = location.station_id;
    },
    [openAnchorInfoWindow]
  );

  const reopenWeatherStationInfoWindow = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationWithLatestData) => {
      openAnchorInfoWindow(marker, getWeatherStationInfoWindow(location));
      openWeatherStationIdRef.current = location.station_id;
    },
    [openAnchorInfoWindow]
  );

  const onLandingMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => {
      openWeatherStationIdRef.current = null;
      openAnchorInfoWindow(marker, getLandingInfoWindow(location));
    },
    [openAnchorInfoWindow]
  );

  // --- Landing marker (paired with paragliding flow below)
  const { currentLandingMarker, clearLandingMarker, showLandingMarker } = useLandingMarker({
    mapInstance,
    onLandingMarkerClick,
  });

  const onParaglidingMarkerClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => {
      if (!mapInstance) return;

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
      openWeatherStationIdRef.current = null;

      setTimeout(() => {
        isParaglidingMarkerClickRef.current = false;
      }, PARAGLIDING_CLICK_FLAG_RESET_MS);
    },
    [mapInstance, variant, showLandingMarker, clearLandingMarker, closeOverlays, openAnchorInfoWindow]
  );

  // --- Marker data + map objects (weather, paragliding, landings)
  const {
    weatherStationMarkers,
    isLoadingMarkers: isLoadingWeatherStationMarkers,
    markersError: markersErrorWeatherStationMarkers,
  } = useWeatherStationMarkers({
    mapInstance,
    onWeatherStationMarkerClick,
    isMain: variant === 'main',
    getOpenWeatherStationId,
    isInfoWindowOpen,
    reopenWeatherStationInfoWindow,
  });

  useEffect(() => {
    const infoWindow = infoWindowRef.current;
    if (!infoWindow) return;

    const closeClickListener = infoWindow.addListener('closeclick', () => {
      clearOpenWeatherStationTracking();
    });

    return () => {
      closeClickListener.remove();
    };
  }, [clearOpenWeatherStationTracking, mapInstance, infoWindowRef]);

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

  // --- Effects: skip clearing landing marker briefly after paragliding click (see flag + constant above)
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

  // --- Derived marker lists (wind / promising filters)
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

  // --- Persist filter toggles into map state
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

  // --- Public API for map UI
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
    closeInfoWindow: closeInfoWindowAndClearOpenWeatherStation,
    closeOverlays,
    currentLandingMarker,
    clearLandingMarker,
    showLandingMarker,
  };
};
