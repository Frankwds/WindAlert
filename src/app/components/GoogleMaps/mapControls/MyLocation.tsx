'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '../../../contexts/ThemeContext';

interface MyLocationProps {
  map: google.maps.Map | null;
  onLocationUpdate: (location: { lat: number; lng: number }) => void;
  onCloseInfoWindow: () => void;
}

const LOCATION_STORAGE_KEY = 'windlord_my_location';

export const MyLocation: React.FC<MyLocationProps> = ({ map, onLocationUpdate, onCloseInfoWindow }) => {
  const { theme } = useTheme();
  const markerRef = useRef<google.maps.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const getCachedLocation = () => {
    try {
      const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const updateMarker = (location: { lat: number; lng: number }) => {
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: location,
      map,
      icon: {
        path: 'M -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 1,
      },
      title: 'My Location',
    });
  };

  const startTracking = () => {
    if (!map || !navigator.geolocation) return;

    onCloseInfoWindow();

    // Use cached location immediately for instant feedback
    const cached = getCachedLocation();
    if (cached) {
      map.setCenter(cached);
      map.setZoom(12);
      updateMarker(cached);
    }

    // Start watching position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
        onLocationUpdate(location);
        updateMarker(location);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Stop tracking on error
        stopTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const handleMyLocationClick = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const clearCache = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    stopTracking();
    alert('Location cache cleared');
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (!map) return null;

  return (
    <div className="absolute bottom-24 right-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <button
          onClick={handleMyLocationClick}
          onContextMenu={clearCache}
          className="w-8 h-8 bg-transparent hover:bg-[var(--accent)]/10 border-none rounded-md cursor-pointer text-[var(--foreground)] duration-200 ease-in-out flex items-center justify-center font-bold text-lg"
          title={isTracking ? "Stop tracking location (Right-click to clear cache)" : "My Location (Right-click to clear cache)"}
        >
          <Image
            src={isTracking ? '/myLocationBlue.png' : (theme === 'dark' ? '/myLocationDark.png' : '/myLocationLight.png')}
            alt="My Location"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};