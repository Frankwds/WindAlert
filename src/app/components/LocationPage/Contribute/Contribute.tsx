'use client';

import React from 'react';
import { ContributeLanding } from './ContributeLanding';
import { ContributeSynchronize } from './ContributeSynchronize';

import { ContributeToggleMain } from './ContributeToggleMain';

interface ContributeProps {
  locationId: string;
  startId: string;
  latitude: number;
  longitude: number;
  takeoffAltitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  landingAltitude?: number;
  is_main: boolean;
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
  is_main,
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
      />

      <ContributeSynchronize startId={startId} />
      <ContributeToggleMain locationId={locationId} is_main={is_main} />
    </div>
  );
};
