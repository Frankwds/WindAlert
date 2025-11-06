'use client';

import React, { useState, useCallback } from 'react';
import { ContributeLanding } from './ContributeLanding';
import { dataCache } from '@/lib/data-cache';
import { ParaglidingLocation } from '@/lib/supabase/types';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';

interface ContributeProps {
  locationId: string;
  startId: string;
  latitude: number;
  longitude: number;
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
  landingLatitude,
  landingLongitude,
  landingAltitude,
  onSave,
}) => {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncWithFlightlog = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch(`/api/contribute/synchronize/${startId}`);

      if (!response.ok) {
        const errorData = await response.json();
        setSyncError(errorData.error || 'Failed to sync with Flightlog');
        return;
      }

      // Get the updated location data
      const updatedLocation: ParaglidingLocation = await response.json();

      // Update the cache with the new location data (without forecast)
      try {
        const locationWithForecast: ParaglidingLocationWithForecast = {
          id: updatedLocation.id,
          name: updatedLocation.name,
          latitude: updatedLocation.latitude,
          longitude: updatedLocation.longitude,
          altitude: updatedLocation.altitude,
          flightlog_id: updatedLocation.flightlog_id,
          is_main: updatedLocation.is_main,
          n: updatedLocation.n,
          e: updatedLocation.e,
          s: updatedLocation.s,
          w: updatedLocation.w,
          ne: updatedLocation.ne,
          se: updatedLocation.se,
          sw: updatedLocation.sw,
          nw: updatedLocation.nw,
          landing_latitude: updatedLocation.landing_latitude,
          landing_longitude: updatedLocation.landing_longitude,
          landing_altitude: updatedLocation.landing_altitude,
          // forecast_cache is optional and not included
        };

        await dataCache.updateParaglidingLocationById(updatedLocation.id, locationWithForecast);
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
        // Fall back to clearing cache
        await dataCache.clearCache();
      }

      // Success - reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error syncing with Flightlog:', error);
      setSyncError('Det skjedde en feil ved synkronisering med Flightlog. Prøv igjen senere.');
    } finally {
      setIsSyncing(false);
    }
  }, [startId]);

  return (
    <div className='mt-6 center justify-center'>
      <h1 className='text-2xl font-bold'>Bidra:</h1>

      <ContributeLanding
        locationId={locationId}
        latitude={latitude}
        longitude={longitude}
        landingLatitude={landingLatitude}
        landingLongitude={landingLongitude}
        landingAltitude={landingAltitude}
        onSave={onSave}
      />

      <div className='mt-4'>
        <div className='rounded-lg'>
          <button
            onClick={handleSyncWithFlightlog}
            disabled={isSyncing}
            className='w-full text-left p-4 focus:outline-none cursor-pointer hover:shadow-[var(--shadow-sm)] hover:brightness-95 relative group bg-[var(--card)] border border-[var(--border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <div className='flex items-center w-full relative z-10'>
              <div className='flex items-center flex-1'>
                {isSyncing ? (
                  <>
                    <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2'></div>
                    Synkroniserer...
                  </>
                ) : (
                  <>Synkroniser med Flightlog</>
                )}
              </div>

              <div className='text-[var(--muted)] flex-shrink-0 ml-2'>
                <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
              </div>
            </div>
            <div className='absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-lg'></div>
          </button>
        </div>

        {syncError && <div className='mt-2 text-sm text-[var(--error)] text-center'>{syncError}</div>}
      </div>
    </div>
  );
};
