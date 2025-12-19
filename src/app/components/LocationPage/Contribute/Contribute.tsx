'use client';

import React from 'react';
import { ContributeLanding } from './ContributeLanding';
import { ContributeSynchronize } from './ContributeSynchronize';

interface ContributeProps {
  locationId: string;
  startId: string;
  latitude: number;
  longitude: number;
  takeoffAltitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  landingAltitude?: number;
  onSave: (landingLat: number, landingLng: number, landingAltitude?: number) => void;
}

export const Contribute: React.FC<ContributeProps> = ({
  locationId,
  startId,
  latitude,
  longitude,
  takeoffAltitude,
  landingLatitude,
  landingLongitude,
  landingAltitude,
  onSave,
}) => {
  return (
    <div className='mt-6 center justify-center'>
      <h1 className='text-2xl font-bold'>Bidra:</h1>

      <ContributeLanding
        locationId={locationId}
        latitude={latitude}
        longitude={longitude}
        takeoffAltitude={takeoffAltitude}
        landingLatitude={landingLatitude}
        landingLongitude={landingLongitude}
        landingAltitude={landingAltitude}
        onSave={onSave}
      />

      <ContributeSynchronize startId={startId} />
    </div>
  );
};
