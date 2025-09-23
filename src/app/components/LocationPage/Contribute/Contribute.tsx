'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Collapsible from '../../shared/Collapsible';
import { ContributeMap } from './ContributeMap';
import { ButtonAccept } from '../../shared';
import { dataCache } from '@/lib/data-cache';

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
  landingLatitude: intialLandingLatitude,
  landingLongitude: initialLandingLongitude,
  landingAltitude: initialLandingAltitude,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLandingLat, setCurrentLandingLat] = useState<number | undefined>(intialLandingLatitude);
  const [currentLandingLng, setCurrentLandingLng] = useState<number | undefined>(initialLandingLongitude);
  const [currentLandingAltitude, setCurrentLandingAltitude] = useState<number | undefined>(initialLandingAltitude);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contributeRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the contribute section when it opens
  useEffect(() => {
    if (isOpen && contributeRef.current) {
      // Small delay to ensure the content is rendered
      setTimeout(() => {
        contributeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [isOpen]);

  const handleLandingChange = useCallback((lat: number, lng: number) => {
    setCurrentLandingLat(lat);
    setCurrentLandingLng(lng);
    setHasChanges(true);
    setError(null); // Clear any previous errors when landing changes
  }, []);

  const handleAltitudeChange = useCallback((altitude: number) => {
    setCurrentLandingAltitude(altitude);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
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
        const response = await fetch('/api/contribute/landing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId,
            takeoffLatitude: latitude,
            takeoffLongitude: longitude,
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

        // Update the cache with the new landing coordinates
        try {
          await dataCache.updateParaglidingLocationById(locationId, {
            landing_latitude: currentLandingLat,
            landing_longitude: currentLandingLng,
            landing_altitude: currentLandingAltitude,
          });
        } catch (cacheError) {
          console.warn('Failed to update cache:', cacheError);
          dataCache.clearCache();
        }

        onSave(currentLandingLat, currentLandingLng, currentLandingAltitude);
        setHasChanges(false);
        setError(null);
        setIsOpen(false);
        alert('Landingen er lagret! Takk for bidraget.');
      } catch (error) {
        console.error('Error saving landing coordinates:', error);
        setError(`Det skjedde en feil. Prøv igjen senere. Meld gjerne fra om feilen via. mail. Legg ved stedets ID som du finner i URLen.`);
      }
    }
  }, [locationId, latitude, longitude, currentLandingLat, currentLandingLng, currentLandingAltitude, onSave]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div ref={contributeRef} className="mt-6 center justify-center">
      <h1 className="text-2xl font-bold">Bidra:</h1>
      <Collapsible
        title="Rediger Landing"
        isOpen={isOpen}
        onToggle={handleToggle}
        className="bg-[var(--card)] border border-[var(--border)] rounded-lg"
      >
        {isOpen ? (
          <div className="space-y-4">
            <div className="text-sm text-[var(--muted)]">
              <p>Klikk på kartet for å plassere landing. Dra den grønne markøren for å flytte landingen.</p>
              <p className="mt-1">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Rød markør: Takeoff
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mx-2 ml-4"></span>
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
            {error && (
              <div className="text-sm text-[var(--error)] text-center mx-20">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label htmlFor="altitude-input" className="text-sm font-medium text-[var(--foreground)]">
                    Høyde:
                  </label>
                  <input
                    id="altitude-input"
                    type="number"
                    min="0"
                    step="1"
                    value={currentLandingAltitude || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        handleAltitudeChange(undefined as any);
                      } else {
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          handleAltitudeChange(numValue);
                        }
                      }
                    }}
                    className="w-20 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    placeholder="0"
                  />
                  <span className="text-xs text-[var(--muted)]">moh.</span>
                </div>

                <ButtonAccept
                  onClick={handleSave}
                  title={currentLandingIsValid(currentLandingLat, currentLandingLng, intialLandingLatitude, initialLandingLongitude) ?
                    'Lagre endringer' : 'Gjør endringer for å lagre'}
                  disabled={!currentLandingIsValid(currentLandingLat, currentLandingLng, intialLandingLatitude, initialLandingLongitude)}
                />
              </div>

            </div>
          </div>
        ) : null}
      </Collapsible>
    </div>
  );
};

const currentLandingIsValid = (
  currentLandingLat: number | undefined, currentLandingLng: number | undefined,
  initialLatitude: number | undefined, initialLongitude: number | undefined
) => {
  if (!currentLandingLat || !currentLandingLng) {
    return false;
  }

  return currentLandingLat !== initialLatitude || currentLandingLng !== initialLongitude;
};
