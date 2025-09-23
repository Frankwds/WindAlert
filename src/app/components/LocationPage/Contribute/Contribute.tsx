'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Collapsible from '../../shared/Collapsible';
import { ContributeMap } from './ContributeMap';
import { ButtonAccept } from '../../shared';

interface ContributeProps {
  locationId: string;
  latitude: number;
  longitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  onSave?: (landingLat: number, landingLng: number) => void;
}

export const Contribute: React.FC<ContributeProps> = ({
  locationId,
  latitude,
  longitude,
  landingLatitude: intialLandingLatitude,
  landingLongitude: initialLandingLongitude,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLandingLat, setCurrentLandingLat] = useState<number | undefined>(intialLandingLatitude);
  const [currentLandingLng, setCurrentLandingLng] = useState<number | undefined>(initialLandingLongitude);
  const [hasChanges, setHasChanges] = useState(false);
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
  }, []);

  const handleSave = useCallback(async () => {
    if (!currentLandingLat || !currentLandingLng) {
      alert('Please select a landing location first by clicking on the map.');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to save this landing location? This change will affect everyone using WindLord.'
    );

    if (confirmed) {
      try {
        const response = await fetch('/api/contribute/landing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId,
            landingLatitude: currentLandingLat,
            landingLongitude: currentLandingLng,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save landing coordinates');
        }

        const result = await response.json();
        console.log('Landing coordinates saved successfully:', result);

        // Call the optional onSave callback
        onSave?.(currentLandingLat, currentLandingLng);
        setHasChanges(false);

        alert('Landing coordinates saved successfully!');
      } catch (error) {
        console.error('Error saving landing coordinates:', error);
        alert(`Failed to save landing coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [locationId, currentLandingLat, currentLandingLng, onSave]);

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

            <div className="flex justify-end">
              <ButtonAccept
                onClick={handleSave}
                title={currentLandingIsValid(currentLandingLat, currentLandingLng, intialLandingLatitude, initialLandingLongitude) ?
                  'Lagre endringer' : 'Gjør endringer for å lagre'}
                disabled={!currentLandingIsValid(currentLandingLat, currentLandingLng, intialLandingLatitude, initialLandingLongitude)}
              />
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
