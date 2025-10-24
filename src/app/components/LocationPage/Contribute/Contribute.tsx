'use client';

import React, { useState, useCallback } from 'react';
import { ContributeLanding } from './ContributeLanding';

interface ContributeProps {
  locationId: string;
  latitude: number;
  longitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  landingAltitude?: number;
  onSave: (landingLat: number, landingLng: number, landingAltitude?: number) => void;
}

export const Contribute: React.FC<ContributeProps> = ({
  locationId,
  latitude,
  longitude,
  landingLatitude,
  landingLongitude,
  landingAltitude,
  onSave
}) => {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncWithFlightlog = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await fetch(`/api/flightlog/${locationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        setSyncError(errorData.error || 'Failed to sync with Flightlog');
        return;
      }

      // Success - reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error syncing with Flightlog:', error);
      setSyncError('Det skjedde en feil ved synkronisering med Flightlog. Prøv igjen senere.');
    } finally {
      setIsSyncing(false);
    }
  }, [locationId]);

  return (
    <div className="mt-6 center justify-center">
      <h1 className="text-2xl font-bold">Bidra:</h1>
      
      <ContributeLanding
        locationId={locationId}
        latitude={latitude}
        longitude={longitude}
        landingLatitude={landingLatitude}
        landingLongitude={landingLongitude}
        landingAltitude={landingAltitude}
        onSave={onSave}
      />

      <div className="mt-4">
        <button
          onClick={handleSyncWithFlightlog}
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSyncing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Synkroniserer...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Synkroniser med Flightlog
            </>
          )}
        </button>
        
        {syncError && (
          <div className="mt-2 text-sm text-[var(--error)] text-center">
            {syncError}
          </div>
        )}
      </div>
    </div>
  );
};
