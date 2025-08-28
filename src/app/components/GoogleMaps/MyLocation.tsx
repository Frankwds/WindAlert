'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '../../contexts/ThemeContext';

interface MyLocationProps {
  map: google.maps.Map | null;
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
}

export const MyLocation: React.FC<MyLocationProps> = ({ map, onLocationUpdate }) => {
  const { theme } = useTheme();
  const handleMyLocationClick = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          onLocationUpdate(newLocation);
        },
        (error) => {
          console.error("Error getting user's location:", error);
          // Optionally, provide user feedback here
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Optionally, provide user feedback here
    }
  };

  if (!map) return null;

  return (
    <div className="absolute bottom-24 right-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <button
          onClick={handleMyLocationClick}
          className="w-8 h-8 bg-transparent hover:bg-[var(--accent)]/10 border-none rounded-md cursor-pointer text-[var(--foreground)] hover:text-[var(--accent)] transition-all duration-200 ease-in-out flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          title="My Location"
        >
          <Image
            src={theme === 'dark' ? '/myLocationDark.png' : '/myLocationLight.png'}
            alt="My Location"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};
