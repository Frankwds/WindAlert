'use client';

import React, { useMemo } from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { MapLayerToggle, ZoomControls, MyLocation, FilterControl, WindFilterCompass, FullscreenControl } from '@/app/components/GoogleMaps/mapControls';
import PromisingFilter from './mapControls/PromisingFilter';
import { Clusterer } from './clusterer';
import { ParaglidingClusterRenderer, WeatherStationClusterRenderer, LandingClusterRenderer } from './clusterer/Renderers';
import { useInfoWindowStyles } from './useInfoWindowStyles';
import { useGoogleMaps } from './hooks/useGoogleMaps';

interface GoogleMapsProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  variant: 'main' | 'all';
}

const getParaglidingClustererOptions = (variant: 'main' | 'all') => ({
  radius: variant === 'main' ? 60 : 125,
  maxZoom: 15,
  minPoints: 2
} as const);

const getWeatherStationClustererOptions = () => ({
  radius: 40,
  maxZoom: 15,
  minPoints: 2
} as const);

const GoogleMaps: React.FC<GoogleMapsProps> = ({ isFullscreen, toggleFullscreen, variant }) => {
  useInfoWindowStyles();

  const {
    mapRef,
    mapInstance,
    isLoading,
    error,
    paraglidingMarkers,
    weatherStationMarkers,
    landingMarkers,
    showParaglidingMarkers,
    showWeatherStationMarkers,
    showLandingsLayer,
    selectedWindDirections,
    windFilterExpanded,
    windFilterAndOperator,
    promisingFilter,
    isPromisingFilterExpanded,
    isFilterControlOpen,
    showSkywaysLayer,
    showThermalsLayer,
    mapType,
    onMapTypeChange,
    setShowParaglidingMarkers,
    setShowWeatherStationMarkers,
    setShowLandingsLayer,
    setWindFilterExpanded,
    setPromisingFilter,
    setIsPromisingFilterExpanded,
    setIsFilterControlOpen,
    setShowSkywaysLayer,
    setShowThermalsLayer,
    handleWindDirectionChange,
    handleWindFilterLogicChange,
    closeOverlays,
    currentLandingMarker
  } = useGoogleMaps({ variant });

  // Create stable renderer instances to prevent recreation on every render
  const paraglidingRenderer = useMemo(() => new ParaglidingClusterRenderer(), []);
  const weatherStationRenderer = useMemo(() => new WeatherStationClusterRenderer(), []);
  const landingRenderer = useMemo(() => new LandingClusterRenderer(), []);

  // Memoized components to prevent unnecessary re-renders
  const memoizedFilterControl = useMemo(() => (
    <FilterControl
      showParagliding={showParaglidingMarkers}
      showWeatherStations={showWeatherStationMarkers}
      showLandings={showLandingsLayer}
      showSkyways={showSkywaysLayer}
      showThermals={showThermalsLayer}
      onParaglidingFilterChange={setShowParaglidingMarkers}
      onWeatherStationFilterChange={setShowWeatherStationMarkers}
      onLandingsFilterChange={setShowLandingsLayer}
      onSkywaysFilterChange={setShowSkywaysLayer}
      onThermalsFilterChange={setShowThermalsLayer}
      isOpen={isFilterControlOpen}
      onToggle={setIsFilterControlOpen}
      closeOverlays={closeOverlays}
    />
  ), [showParaglidingMarkers, showWeatherStationMarkers, showLandingsLayer, showSkywaysLayer, showThermalsLayer, isFilterControlOpen, closeOverlays]);

  const memoizedWindFilterCompass = useMemo(() => (
    <WindFilterCompass
      onWindDirectionChange={handleWindDirectionChange}
      selectedDirections={selectedWindDirections}
      isExpanded={windFilterExpanded}
      setIsExpanded={setWindFilterExpanded}
      windFilterAndOperator={windFilterAndOperator}
      onFilterLogicChange={handleWindFilterLogicChange}
      closeOverlays={closeOverlays}
      variant={variant}
    />
  ), [selectedWindDirections, windFilterExpanded, windFilterAndOperator, handleWindDirectionChange, handleWindFilterLogicChange, closeOverlays, variant]);

  const memoizedPromisingFilter = useMemo(() => {
    if (variant !== 'main') return null;
    return (
      <PromisingFilter
        isExpanded={isPromisingFilterExpanded}
        setIsExpanded={setIsPromisingFilterExpanded}
        onFilterChange={setPromisingFilter}
        initialFilter={promisingFilter}
        closeOverlays={closeOverlays}
      />
    );
  }, [variant, isPromisingFilterExpanded, promisingFilter, closeOverlays]);

  const memoizedParaglidingClusterer = useMemo(() => {
    if (!mapInstance || paraglidingMarkers.length === 0) return null;
    return (
      <Clusterer
        map={mapInstance}
        markers={paraglidingMarkers}
        renderer={paraglidingRenderer}
        algorithmOptions={getParaglidingClustererOptions(variant)}
      />
    );
  }, [mapInstance, paraglidingMarkers, paraglidingRenderer, variant]);

  const memoizedWeatherStationClusterer = useMemo(() => {
    if (!mapInstance || weatherStationMarkers.length === 0) return null;
    return (
      <Clusterer
        map={mapInstance}
        markers={weatherStationMarkers}
        renderer={weatherStationRenderer}
        algorithmOptions={getWeatherStationClustererOptions()}
      />
    );
  }, [mapInstance, weatherStationMarkers, weatherStationRenderer]);

  const memoizedLandingClusterer = useMemo(() => {
    if (!mapInstance || landingMarkers.length === 0) return null;
    return (
      <Clusterer
        map={mapInstance}
        markers={landingMarkers}
        renderer={landingRenderer}
        algorithmOptions={getParaglidingClustererOptions(variant)}
      />
    );
  }, [mapInstance, landingMarkers, landingRenderer, variant]);


  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load map"
        showRetry={false}
      />
    );
  }

  return (
    <div className={"w-full h-full"}>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner size="lg" text="Laster kart..." overlay />}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {memoizedParaglidingClusterer}
        {memoizedWeatherStationClusterer}
        {memoizedLandingClusterer}

        {mapInstance && (
          <>
            {currentLandingMarker && (
              <div style={{ display: 'none' }}>
                {/* Landing marker is automatically rendered by Google Maps when added to map */}
              </div>
            )}
            <MapLayerToggle
              map={mapInstance}
              initialMapType={mapType}
              onMapTypeChange={onMapTypeChange}
            />
            <div className="absolute bottom-3 right-3 z-10 flex flex-row gap-2">
              <FullscreenControl isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
              <ZoomControls map={mapInstance} />
            </div>
            <MyLocation map={mapInstance} closeOverlays={closeOverlays} />
            {memoizedFilterControl}
            {memoizedWindFilterCompass}
            {memoizedPromisingFilter}
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleMaps;
