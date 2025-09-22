'use client';

import React, { useState, useCallback } from 'react';
import Collapsible from '../../shared/Collapsible';
import { ContributeMap } from './ContributeMap';

interface ContributeProps {
  latitude: number;
  longitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  onSave?: (landingLat: number, landingLng: number) => void;
}

export const Contribute: React.FC<ContributeProps> = ({
  latitude,
  longitude,
  landingLatitude,
  landingLongitude,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLandingLat, setCurrentLandingLat] = useState<number | undefined>(landingLatitude);
  const [currentLandingLng, setCurrentLandingLng] = useState<number | undefined>(landingLongitude);
  const [hasChanges, setHasChanges] = useState(false);

  const handleLandingChange = useCallback((lat: number, lng: number) => {
    setCurrentLandingLat(lat);
    setCurrentLandingLng(lng);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!currentLandingLat || !currentLandingLng) {
      alert('Please select a landing location first by clicking on the map.');
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to save this landing location? This change will affect everyone using WindLord.'
    );

    if (confirmed) {
      onSave?.(currentLandingLat, currentLandingLng);
      setHasChanges(false);
    }
  }, [currentLandingLat, currentLandingLng, onSave]);

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return (
    <div className="mt-6 center justify-center">
      <h1 className="text-2xl font-bold">Bidra:</h1>
      <Collapsible
        title="Legg til Landing"
        isOpen={isOpen}
        onToggle={handleToggle}
        className="bg-[var(--card)] border border-[var(--border)] rounded-lg"
      >
        {isOpen ? (
          <div className="space-y-4">
            <div className="text-sm text-[var(--muted)]">
              <p>Klikk på kartet for å plassere landing. Dra den grønne markøren for å flytte den.</p>
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
              landingLatitude={landingLatitude}
              landingLongitude={landingLongitude}
              onLandingChange={handleLandingChange}
            />

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={!currentLandingLat || !currentLandingLng}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${currentLandingLat && currentLandingLng
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed'
                  }`}
              >
                {hasChanges ? 'Lagre endringer' : 'Lagre landing'}
              </button>
            </div>
          </div>
        ) : null}
      </Collapsible>
    </div>
  );
};
