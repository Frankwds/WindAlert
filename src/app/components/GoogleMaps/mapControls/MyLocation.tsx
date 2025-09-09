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
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const updateMarker = (location: { lat: number; lng: number }) => {
    if (!map) return;

    if (markerRef.current) {
      // Just update the position of the existing marker
      markerRef.current.position = location;
    } else {
      // Create the marker only if it doesn't exist
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #4285F4;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `;

      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map,
        title: 'My Location',
        content: markerElement,
      });
    }
  };

  const startTracking = () => {
    if (!map || !navigator.geolocation) return;

    onCloseInfoWindow();
    // Start watching position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        updateMarker(location);

        // Center map if in follow mode
        if (isFollowing && map) {
          map.setCenter(location);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Stop tracking on error
        stopTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
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
      if (isFollowing) {
        // Stop following but keep tracking
        setIsFollowing(false);
      } else {
        // Start following again
        setIsFollowing(true);
      }
    } else {
      // Start tracking and following
      startTracking();
      setIsFollowing(true);
    }
  };

  // TODO - remove local storage? - Change the center on follow toggle:true

  // Add map interaction listeners to stop follow mode
  useEffect(() => {
    if (!map) return;

    const stopFollowing = () => {
      if (isFollowing) {
        setIsFollowing(false);
      }
    };

    const dragListener = map.addListener('dragstart', stopFollowing);
    return () => {
      google.maps.event.removeListener(dragListener);
    };
  }, [map, isFollowing]);

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
          className="w-8 h-8 bg-transparent hover:bg-[var(--accent)]/10 border-none rounded-md cursor-pointer text-[var(--foreground)] duration-200 ease-in-out flex items-center justify-center font-bold text-lg"
          title={
            isTracking
              ? (isFollowing ? "Stop following location (Right-click to clear cache)" : "Follow location (Right-click to clear cache)")
              : "My Location (Right-click to clear cache)"
          }
        >
          <Image
            src={isFollowing ? '/myLocationBlue.png' : (theme === 'dark' ? '/myLocationDark.png' : '/myLocationLight.png')}
            alt="My Location"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};