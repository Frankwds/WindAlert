'use client';

import React, { useMemo } from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { MapLayerToggle, ZoomControls, MyLocation, WindFilterCompass } from '@/app/components/GoogleMaps/mapControls';
import { Clusterer } from './clusterer';
import { ParaglidingClusterRenderer } from './clusterer/Renderers';
import { useInfoWindowStyles } from './useInfoWindowStyles';
import { useGoogleMapsAll } from './hooks/useGoogleMapsAll';

const CLUSTERER_OPTIONS = {
  radius: 60,
  maxZoom: 15,
  minPoints: 2
} as const;

const GoogleMapsAll: React.FC = () => {
  useInfoWindowStyles();

  const {
    mapRef,
    mapInstance,
    isLoading,
    error,
    paraglidingMarkers,
    selectedWindDirections,
    windFilterExpanded,
    windFilterAndOperator,
    setWindFilterExpanded,
    handleWindDirectionChange,
    handleWindFilterLogicChange,
    closeOverlays
  } = useGoogleMapsAll();

  // Create stable renderer instance
  const paraglidingRenderer = useMemo(() => new ParaglidingClusterRenderer(), []);

  // Memoized clusterer for all paragliding locations
  const memoizedParaglidingClusterer = useMemo(() => {
    if (!mapInstance || paraglidingMarkers.length === 0) return null;
    return (
      <Clusterer
        map={mapInstance}
        markers={paraglidingMarkers}
        renderer={paraglidingRenderer}
        algorithmOptions={CLUSTERER_OPTIONS}
      />
    );
  }, [mapInstance, paraglidingMarkers, paraglidingRenderer]);

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
    <div className="w-full h-full">
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner size="lg" text="Laster kart..." overlay />}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {memoizedParaglidingClusterer}

        {mapInstance && (
          <>
            {/* Layer Toggle */}
            <MapLayerToggle map={mapInstance} />

            {/* Wind Direction Filter */}
            <WindFilterCompass
              onWindDirectionChange={handleWindDirectionChange}
              selectedDirections={selectedWindDirections}
              isExpanded={windFilterExpanded}
              setIsExpanded={setWindFilterExpanded}
              windFilterAndOperator={windFilterAndOperator}
              onFilterLogicChange={handleWindFilterLogicChange}
              closeOverlays={closeOverlays}
            />

            {/* Map Controls */}
            <div className="absolute bottom-3 right-3 z-10 flex flex-row gap-2">
              <ZoomControls map={mapInstance} />
            </div>
            <MyLocation map={mapInstance} closeOverlays={closeOverlays} />
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsAll;
