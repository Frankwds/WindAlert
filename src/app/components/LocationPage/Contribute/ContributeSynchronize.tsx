'use client';

import React, { useState, useCallback } from 'react';
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
  );
};
