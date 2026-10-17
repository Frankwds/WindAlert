'use client';

import React, { useState, useCallback } from 'react';
import Collapsible from '../../shared/Collapsible';
import { ButtonAccept } from '../../shared';
import { dataCache } from '@/lib/data-cache';
import { ParaglidingLocation, ParaglidingLocationWithForecast } from '@/lib/supabase/types';

interface ContributeSynchronizeProps {
  startId: string;
}

export const ContributeSynchronize: React.FC<ContributeSynchronizeProps> = ({ startId }) => {
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
        await dataCache.updateParaglidingLocationById(
          updatedLocation.id,
          updatedLocation as ParaglidingLocationWithForecast
        );
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
    <div className='mt-4'>
      <Collapsible
        title='Synkroniser med Flightlog'
        className='bg-[var(--card)] border border-[var(--border)] rounded-lg'
      >
        <div className='space-y-4 px-3'>
          <p className='text-sm text-[var(--foreground)]'>
            Endringer som gjøres på starten i Flightlog – for eksempel navn, koordinater eller vindretninger –
            synkroniseres automatisk til WindLord omtrent én gang i måneden. Vil du ha oppdateringen med en gang, kan
            du trykke på knappen under.
          </p>

          <ButtonAccept
            onClick={handleSyncWithFlightlog}
            title={isSyncing ? 'Synkroniserer...' : 'Synkroniser nå'}
            disabled={isSyncing}
          />

          {syncError && <div className='text-sm text-[var(--error)]'>{syncError}</div>}
        </div>
      </Collapsible>
    </div>
  );
};
