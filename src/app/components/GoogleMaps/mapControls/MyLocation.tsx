'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTheme } from '../../../contexts/ThemeContext';

interface MyLocationProps {
  map: google.maps.Map | null;
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
  onCloseInfoWindow: () => void;
}

const LOCATION_STORAGE_KEY = 'windalert_last_known_location';

export const MyLocation: React.FC<MyLocationProps> = ({ map, onLocationUpdate, onCloseInfoWindow }) => {
  const { theme } = useTheme();
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const [isUsingCachedLocation, setIsUsingCachedLocation] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  const getCachedLocation = (): { lat: number; lng: number } | null => {
    try {
      const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (cached) {
        const location = JSON.parse(cached);
        // Validate that the cached location has valid coordinates
        if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
          return location;
        }
      }
    } catch (error) {
      console.warn('Failed to parse cached location:', error);
    }
    return null;
  };

  const cacheLocation = (location: { lat: number; lng: number }) => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch (error) {
      console.warn('Failed to cache location:', error);
    }
  };

  const clearCachedLocation = () => {
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      setIsUsingCachedLocation(false);
      console.log('Cached location cleared');
    } catch (error) {
      console.warn('Failed to clear cached location:', error);
    }
  };

  const createUserLocationMarker = (location: { lat: number; lng: number }) => {
    if (!map) return;

    // Remove the old marker
    if (userLocationMarker) {
      userLocationMarker.setMap(null);
    }

    // Create a new marker for the user's location (the "blue dot")
    const blueDotIcon = {
      path: 'M -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 1,
    };

    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: blueDotIcon,
      title: 'My Location',
    });

    setUserLocationMarker(marker);
  };

  const handleMyLocationClick = () => {
    if (!map) return;

    // Close any open info window when MyLocation button is clicked
    onCloseInfoWindow();

    if (navigator.geolocation) {
      // Check if we have a cached location first
      const cachedLocation = getCachedLocation();
      if (cachedLocation) {
        // Use cached location immediately for instant feedback
        map.setCenter(cachedLocation);
        map.setZoom(12);
        createUserLocationMarker(cachedLocation);
        setIsUsingCachedLocation(true);
      }

      setIsUpdatingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Cache the new location
          cacheLocation(newLocation);

          // Update map and marker
          onLocationUpdate(newLocation);
          createUserLocationMarker(newLocation);
          setIsUsingCachedLocation(false);
          setIsUpdatingLocation(false);
        },
        (error) => {
          console.error("Error getting user's location:", error);
          setIsUpdatingLocation(false);

          // If getting new location fails, at least we have the cached one
          const cachedLocation = getCachedLocation();
          if (cachedLocation) {
            console.log('Using cached location due to geolocation error');
            setIsUsingCachedLocation(true);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 second timeout
          maximumAge: 300000 // Accept cached positions up to 5 minutes old
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');

      // Fallback to cached location if available
      const cachedLocation = getCachedLocation();
      if (cachedLocation) {
        map.setCenter(cachedLocation);
        map.setZoom(12);
        createUserLocationMarker(cachedLocation);
        setIsUsingCachedLocation(true);
      }
    }
  };

  // Right-click handler for privacy-conscious users
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearCachedLocation();
    alert('Cached location cleared for privacy');
  };

  if (!map) return null;

  return (
    <div className="absolute bottom-24 right-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <button
          onClick={handleMyLocationClick}
          onContextMenu={handleRightClick}
          disabled={isUpdatingLocation}
          className={`w-8 h-8 bg-transparent hover:bg-[var(--accent)]/10 border-none rounded-md cursor-pointer text-[var(--foreground)] hover:text-[var(--accent)] transition-all duration-200 ease-in-out flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${isUsingCachedLocation ? 'ring-2 ring-yellow-400' : ''
            } ${isUpdatingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={`My Location${isUsingCachedLocation ? ' (Using cached location)' : ''}${isUpdatingLocation ? ' (Updating...)' : ''} (Right-click to clear cache)`}
        >
          <Image
            src={theme === 'dark' ? '/myLocationDark.png' : '/myLocationLight.png'}
            alt="My Location"
            width={24}
            height={24}
            className={isUpdatingLocation ? 'animate-pulse' : ''}
          />
        </button>
      </div>
    </div>
  );
};
