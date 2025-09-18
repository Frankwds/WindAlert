import { useCallback, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useMapInstance, useMapState } from './map';
import { useWeatherStationMarkers, useParaglidingMarkers, useMarkerFiltering } from './markers';
import { useMapFilters } from './filters';
import { useInfoWindows, useOverlayManagement } from './controls';
import { getMainParaglidingInfoWindow, getAllParaglidingInfoWindow, getWeatherStationInfoWindow } from '../InfoWindows';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

type Variant = 'main' | 'all';

interface UseGoogleMapsProps {
  variant: Variant;
}

export const useGoogleMaps = ({ variant }: UseGoogleMapsProps) => {
  const { mapState, updateFilters, updateMapPosition } = useMapState();

  const filters = useMapFilters({
    initialShowParaglidingMarkers: mapState.showParaglidingMarkers,
    initialShowWeatherStationMarkers: mapState.showWeatherStationMarkers,
    initialSelectedWindDirections: mapState.selectedWindDirections,
    initialWindFilterAndOperator: mapState.windFilterAndOperator,
    initialPromisingFilter: variant === 'main' ? mapState.promisingFilter : null,
    initialShowSkywaysLayer: mapState.showSkywaysLayer
  });

  const { infoWindowRef, closeInfoWindow, openInfoWindow } = useInfoWindows();

  const { closeOverlays } = useOverlayManagement({
    setWindFilterExpanded: filters.setWindFilterExpanded,
    setIsPromisingFilterExpanded: filters.setIsPromisingFilterExpanded,
    setIsFilterControlOpen: filters.setIsFilterControlOpen,
    closeInfoWindow
  });

  const onMapReadyRef = useRef<(map: google.maps.Map) => void>(() => { });
  const onMapClickRef = useRef<() => void>(() => { });
  const onMapPositionChangeRef = useRef(updateMapPosition);

  useEffect(() => {
    onMapClickRef.current = closeOverlays;
  }, [closeOverlays]);

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
    }, []),
    onMapClick: useCallback(() => {
      onMapClickRef.current();
    }, []),
    showSkywaysLayer: filters.showSkywaysLayer,
    onMapPositionChange: useCallback((center: { lat: number; lng: number }, zoom: number) => {
      onMapPositionChangeRef.current(center, zoom);
    }, [])
  });

  const onWeatherStationMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationMarkerData) => {
    if (!mapInstance) return;

    closeOverlays();

    const infoWindowContent = document.createElement('div');
    const root = createRoot(infoWindowContent);
    root.render(getWeatherStationInfoWindow(location));
    openInfoWindow(mapInstance, marker, infoWindowContent);
  }, [mapInstance, openInfoWindow, closeOverlays]);

  const onParaglidingMarkerClick = useCallback((marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData) => {
    if (!mapInstance) return;

    closeOverlays();

    const infoWindowContent = document.createElement('div');
    const root = createRoot(infoWindowContent);
    root.render(variant === 'main'
      ? getMainParaglidingInfoWindow(location)
      : getAllParaglidingInfoWindow(location)
    );
    openInfoWindow(mapInstance, marker, infoWindowContent);
  }, [mapInstance, openInfoWindow, closeOverlays, variant]);

  const {
    weatherStationMarkers,
    isLoadingMarkers: isLoadingWeatherStationMarkers,
    markersError: markersErrorWeatherStationMarkers
  } = useWeatherStationMarkers({
    mapInstance,
    onWeatherStationMarkerClick
  });

  const { paraglidingMarkers,
    isLoadingMarkers: isLoadingParaglidingMarkers,
    markersError: markersErrorParaglidingMarkers
  } = useParaglidingMarkers({
    mapInstance,
    onParaglidingMarkerClick,
    variant
  });

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

    mapRef,
    mapInstance,
    isLoading: isLoading || isLoadingParaglidingMarkers || isLoadingWeatherStationMarkers,
    error: error || markersErrorParaglidingMarkers || markersErrorWeatherStationMarkers,


    paraglidingMarkers: filteredMarkers.filteredParaglidingMarkers,
    weatherStationMarkers: filteredMarkers.filteredWeatherStationMarkers,


    ...filters,


    infoWindowRef,
    closeInfoWindow,
    closeOverlays
  };
};
