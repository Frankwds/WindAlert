'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Collapsible from '../../shared/Collapsible';
import { ContributeMap } from './ContributeMap';
import { ButtonAccept } from '../../shared';
import { dataCache } from '@/lib/data-cache';
import { useElevation } from './hooks/useElevation';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '../../Navigation/LoginButton';
import { supabase } from '@/lib/supabase/client';
import { ParaglidingLocation, ParaglidingLocationWithForecast } from '@/lib/supabase/types';

interface ContributeLandingProps {
  locationId: string;
  latitude: number;
  longitude: number;
  takeoffAltitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  landingAltitude?: number;
  onSave: (landingLat: number, landingLng: number, landingAltitude?: number) => void;
}

export const ContributeLanding: React.FC<ContributeLandingProps> = ({
  locationId,
  latitude,
  longitude,
  takeoffAltitude,
  landingLatitude: intialLandingLatitude,
  landingLongitude: initialLandingLongitude,
  landingAltitude: initialLandingAltitude,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLandingLat, setCurrentLandingLat] = useState<number | undefined>(intialLandingLatitude);
  const [currentLandingLng, setCurrentLandingLng] = useState<number | undefined>(initialLandingLongitude);
  const [currentLandingAltitude, setCurrentLandingAltitude] = useState<number | undefined>(initialLandingAltitude);
  const [isManualAltitude, setIsManualAltitude] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contributeRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth();

  // Fetch elevation when landing coordinates change
  const {
    altitude: fetchedAltitude,
    isLoading: isFetchingAltitude,
    error: elevationError,
  } = useElevation({
    latitude: currentLandingLat,
    longitude: currentLandingLng,
    enabled: isOpen && !isManualAltitude,
  });

  // Update altitude when elevation is fetched (unless manually set)
  useEffect(() => {
    if (!isManualAltitude && fetchedAltitude !== undefined && currentLandingLat && currentLandingLng) {
      setCurrentLandingAltitude(fetchedAltitude);
    }
  }, [fetchedAltitude, isManualAltitude, currentLandingLat, currentLandingLng]);

  // Scroll to the bottom of the contribute section when it opens
  useEffect(() => {
    if (isOpen && contributeRef.current) {
      // Small delay to ensure the content is rendered
      setTimeout(() => {
        contributeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 100);
    }
  }, [isOpen]);

  const handleLandingChange = useCallback(
    (lat: number, lng: number) => {
      if (!user) {
        return; // Don't allow changes if not authenticated
      }
      setCurrentLandingLat(lat);
      setCurrentLandingLng(lng);
      // Reset manual altitude flag when landing position changes to allow auto-fetch
      setIsManualAltitude(false);

      setError(null); // Clear any previous errors when landing changes
    },
    [user]
  );

  const handleAltitudeChange = useCallback((altitude: number | undefined) => {
    setCurrentLandingAltitude(altitude);
    // Mark as manual if user starts typing
    if (altitude !== undefined) {
      setIsManualAltitude(true);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) {
      alert('Du må være innlogget for å bidra');
      return;
    }

    if (!currentLandingLat || !currentLandingLng) {
      alert('Velg et landingsted først ved å klikke på kartet.');
      return;
    }

    const confirmed = confirm(
      'Er du sikker på at du vil lagre dette landingstedet? Endringen din vil vises for alle som bruker WindLord.'
    );

    if (confirmed) {
      setError(null); // Clear any previous errors
      try {
        // Get the session token to pass in Authorization header
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        if (!authToken) {
          setError('Du må være innlogget for å bidra. Vennligst logg inn og prøv igjen.');
          return;
        }

        const response = await fetch('/api/contribute/landing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            locationId,
            takeoffLatitude: latitude,
            takeoffLongitude: longitude,
            takeoffAltitude,
            landingLatitude: currentLandingLat,
            landingLongitude: currentLandingLng,
            landingAltitude: currentLandingAltitude,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to save landing coordinates');
          return;
        }

        // Get the updated location data
        const responseData = await response.json();
        const updatedLocation: ParaglidingLocation = responseData.location;

        // Update the cache with the new location data
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

        onSave(currentLandingLat, currentLandingLng, currentLandingAltitude);
        setError(null);
        setIsOpen(false);
        alert('Landingen er lagret! Takk for bidraget.');
      } catch (error) {
        console.error('Error saving landing coordinates:', error);
        setError(
          `Det skjedde en feil. Prøv igjen senere. Meld gjerne fra om feilen via. mail. Legg ved stedets ID som du finner i URLen.`
        );
      }
    }
  }, [
    locationId,
    latitude,
    longitude,
    takeoffAltitude,
    currentLandingLat,
    currentLandingLng,
    currentLandingAltitude,
    onSave,
    user,
  ]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div ref={contributeRef}>
      <Collapsible
        title='Rediger Landing'
        isOpen={isOpen}
        onToggle={handleToggle}
        className='bg-[var(--card)] border border-[var(--border)] rounded-lg'
      >
        {isOpen ? (
          <div className='space-y-4'>
            {!user && !authLoading ? (
              <div className='space-y-3 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg'>
                <p className='text-sm text-[var(--foreground)] text-center'>Du må være innlogget for å bidra</p>
                <div className='flex justify-center'>
                  <LoginButton />
                </div>
              </div>
            ) : (
              <>
                <div className='text-sm text-[var(--muted)]'>
                  <p>Klikk på kartet for å plassere landing. Dra den grønne markøren for å flytte landingen.</p>
                  <p className='mt-1'>
                    <span className='inline-block w-3 h-3 bg-red-500 rounded-full mr-2'></span>
                    Rød markør: Takeoff
                    <span className='inline-block w-3 h-3 bg-green-500 rounded-full mx-2 ml-4'></span>
                    Grønn markør: Landing
                  </p>
                </div>

                <ContributeMap
                  latitude={latitude}
                  longitude={longitude}
                  landingLatitude={intialLandingLatitude}
                  landingLongitude={initialLandingLongitude}
                  onLandingChange={handleLandingChange}
                />
              </>
            )}
            {error && <div className='text-sm text-[var(--error)] text-center mx-20'>{error}</div>}
            {user && (
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2'>
                    <label htmlFor='altitude-input' className='text-sm font-medium text-[var(--foreground)]'>
                      Høyde:
                    </label>
                    <div className='relative'>
                      <input
                        id='altitude-input'
                        type='number'
                        min='0'
                        step='1'
                        value={currentLandingAltitude || ''}
                        onChange={e => {
                          const value = e.target.value;
                          if (value === '') {
                            handleAltitudeChange(undefined);
                          } else {
                            const numValue = parseInt(value, 10);
                            if (!isNaN(numValue)) {
                              handleAltitudeChange(numValue);
                            }
                          }
                        }}
                        className='w-20 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'
                        placeholder='0'
                        disabled={isFetchingAltitude}
                      />
                      {isFetchingAltitude && (
                        <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                          <div className='w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50'></div>
                        </div>
                      )}
                    </div>
                    <span className='text-xs text-[var(--muted)]'>moh.</span>
                    {elevationError && !isManualAltitude && (
                      <span className='text-xs text-[var(--muted)] italic'>({elevationError})</span>
                    )}
                  </div>

                  <ButtonAccept
                    onClick={handleSave}
                    title={
                      !user
                        ? 'Du må være innlogget for å lagre'
                        : currentLandingIsValid(
                              currentLandingLat,
                              currentLandingLng,
                              intialLandingLatitude,
                              initialLandingLongitude
                            )
                          ? 'Lagre endringer'
                          : 'Gjør endringer for å lagre'
                    }
                    disabled={
                      !user ||
                      !currentLandingIsValid(
                        currentLandingLat,
                        currentLandingLng,
                        intialLandingLatitude,
                        initialLandingLongitude
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Collapsible>
    </div>
  );
};

const currentLandingIsValid = (
  currentLandingLat: number | undefined,
  currentLandingLng: number | undefined,
  initialLatitude: number | undefined,
  initialLongitude: number | undefined
) => {
  if (!currentLandingLat || !currentLandingLng) {
    return false;
  }

  return currentLandingLat !== initialLatitude || currentLandingLng !== initialLongitude;
};
