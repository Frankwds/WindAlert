'use client';

import React from 'react';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { ErrorState } from '../../shared/ErrorState';
import { MapLayerToggle, ZoomControls } from '../../GoogleMaps/mapControls';
import { useContributeMap } from './useContributeMap';

interface ContributeMapProps {
  latitude: number;
  longitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  onLandingChange?: (lat: number, lng: number) => void;
}

export const ContributeMap: React.FC<ContributeMapProps> = ({
  latitude,
  longitude,
  landingLatitude,
  landingLongitude,
  onLandingChange
}) => {
  const {
    mapRef,
    mapInstance,
    isLoading,
    error
  } = useContributeMap({
    latitude,
    longitude,
    landingLatitude,
    landingLongitude,
    onLandingChange
  });

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
    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-[var(--border)]">
      {isLoading && <LoadingSpinner size="lg" text="Laster kart..." overlay />}

      <div
        ref={mapRef}
        className="w-full h-full"
      />

      {mapInstance && (
        <>
          <MapLayerToggle map={mapInstance} />
          <ZoomControls map={mapInstance} />
        </>
      )}
    </div>
  );
};
