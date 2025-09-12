'use client';

import React, { useMemo } from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { MapLayerToggle, ZoomControls, MyLocation, FilterControl, WindFilterCompass, FullscreenControl } from '@/app/components/GoogleMaps/mapControls';
import PromisingFilter from './mapControls/PromisingFilter';
import { Clusterer } from './clusterer';
import { ParaglidingClusterRenderer, WeatherStationClusterRenderer } from './clusterer/Renderers';
import { useInfoWindowStyles } from './useInfoWindowStyles';
import { useGoogleMaps } from './hooks/useGoogleMaps';

interface GoogleMapsProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const CLUSTERER_CONFIG = {
  RADIUS: 60,
  MAX_ZOOM: 15,
  MIN_POINTS: 2
} as const;

const GoogleMaps: React.FC<GoogleMapsProps> = ({ isFullscreen, toggleFullscreen }) => {
  useInfoWindowStyles();

  const {
    mapRef,
    mapInstance,
    isLoading,
    error,
    filteredParaglidingMarkers,
    filteredWeatherStationMarkers,
    showParaglidingMarkers,
    showWeatherStationMarkers,
    selectedWindDirections,
    windFilterExpanded,
    windFilterAndOperator,
    promisingFilter,
    isPromisingFilterExpanded,
    isFilterControlOpen,
    showSkywaysLayer,
    setShowParaglidingMarkers,
    setShowWeatherStationMarkers,
    setWindFilterExpanded,
    setPromisingFilter,
    setIsPromisingFilterExpanded,
    setIsFilterControlOpen,
    setShowSkywaysLayer,
    handleWindDirectionChange,
    handleWindFilterLogicChange,
    closeOverlays
  } = useGoogleMaps({ isFullscreen, toggleFullscreen });


  // Memoized components to prevent unnecessary re-renders
  const memoizedFilterControl = useMemo(() => (
    <FilterControl
      showParagliding={showParaglidingMarkers}
      showWeatherStations={showWeatherStationMarkers}
      showSkyways={showSkywaysLayer}
      onParaglidingFilterChange={setShowParaglidingMarkers}
      onWeatherStationFilterChange={setShowWeatherStationMarkers}
      onSkywaysFilterChange={setShowSkywaysLayer}
      isOpen={isFilterControlOpen}
      onToggle={setIsFilterControlOpen}
      closeOverlays={closeOverlays}
    />
  ), [showParaglidingMarkers, showWeatherStationMarkers, showSkywaysLayer, isFilterControlOpen, closeOverlays]);

  const memoizedWindFilterCompass = useMemo(() => (
    <WindFilterCompass
      onWindDirectionChange={handleWindDirectionChange}
      selectedDirections={selectedWindDirections}
      isExpanded={windFilterExpanded}
      setIsExpanded={setWindFilterExpanded}
      windFilterAndOperator={windFilterAndOperator}
      onFilterLogicChange={handleWindFilterLogicChange}
      closeOverlays={closeOverlays}
    />
  ), [selectedWindDirections, windFilterExpanded, windFilterAndOperator, handleWindDirectionChange, handleWindFilterLogicChange, closeOverlays]);

  const memoizedPromisingFilter = useMemo(() => (
    <PromisingFilter
      isExpanded={isPromisingFilterExpanded}
      setIsExpanded={setIsPromisingFilterExpanded}
      onFilterChange={setPromisingFilter}
      initialFilter={promisingFilter}
      closeOverlays={closeOverlays}
    />
  ), [isPromisingFilterExpanded, promisingFilter, closeOverlays]);

  const memoizedParaglidingClusterer = useMemo(() => {
    if (!mapInstance || filteredParaglidingMarkers.length === 0) return null;
    return (
      <Clusterer
        map={mapInstance}
        markers={filteredParaglidingMarkers}
        renderer={new ParaglidingClusterRenderer()}
        algorithmOptions={{
          radius: CLUSTERER_CONFIG.RADIUS,
          maxZoom: CLUSTERER_CONFIG.MAX_ZOOM,
          minPoints: CLUSTERER_CONFIG.MIN_POINTS
        }}
      />
    );
  }, [mapInstance, filteredParaglidingMarkers]);

  const memoizedWeatherStationClusterer = useMemo(() => {
    if (!mapInstance || filteredWeatherStationMarkers.length === 0) return null;
    return (
      <Clusterer
        map={mapInstance}
        markers={filteredWeatherStationMarkers}
        renderer={new WeatherStationClusterRenderer()}
        algorithmOptions={{
          radius: CLUSTERER_CONFIG.RADIUS,
          maxZoom: CLUSTERER_CONFIG.MAX_ZOOM,
          minPoints: CLUSTERER_CONFIG.MIN_POINTS
        }}
      />
    );
  }, [mapInstance, filteredWeatherStationMarkers]);


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
    <div className={`w-full h-full ${isFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 z-[1000]' : ''}`}>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner size="lg" text="Loading map..." overlay />}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {memoizedParaglidingClusterer}
        {memoizedWeatherStationClusterer}

        {mapInstance && (
          <>
            <MapLayerToggle map={mapInstance} />
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
