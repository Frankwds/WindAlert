'use client';

import React, { useMemo } from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { ZoomControls, MyLocation } from '@/app/components/GoogleMaps/mapControls';
import { Clusterer } from './clusterer';
import { ParaglidingClusterRenderer } from './clusterer/Renderers';
import { useInfoWindowStyles } from './useInfoWindowStyles';
import { useGoogleMaps } from './hooks/useGoogleMaps';

interface GoogleMapsAllProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

// Simplified clusterer options for all locations
const CLUSTERER_OPTIONS = {
  radius: 60,
  maxZoom: 15,
  minPoints: 2
} as const;

const GoogleMapsAll: React.FC<GoogleMapsAllProps> = ({ isFullscreen, toggleFullscreen }) => {
  useInfoWindowStyles();

  const {
    mapRef,
    mapInstance,
    isLoading,
    error,
    paraglidingMarkers, // Use all paragliding markers, not filtered ones
    closeOverlays
  } = useGoogleMaps({ isFullscreen, toggleFullscreen });

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
    <div className={`w-full h-full ${isFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 z-[1000]' : ''}`}>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner size="lg" text="Loading map..." overlay />}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {memoizedParaglidingClusterer}

        {mapInstance && (
          <>
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
