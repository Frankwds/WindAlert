'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '../../../contexts/ThemeContext';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

interface MyLocationProps {
  map: google.maps.Map | null;
  closeOverlays: () => void;
}

export const MyLocation: React.FC<MyLocationProps> = ({ map, closeOverlays }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const updateMarker = (location: { lat: number; lng: number }) => {
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.position = location;
    } else {
      const markerElement = document.createElement('div');
      markerElement.style.transform = 'translate(0%, 50%)';
      markerElement.innerHTML = `
        <img 
          src="/paragliderBlue.png" 
          alt="My Location" 
          style="
            width: 24px;
            height: 24px;
            filter: drop-shadow(-2px -2px 3px rgba(0,0,0,0.6)) drop-shadow(-2px -2px 2px rgba(0,0,0,0.4));
          "
        />
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
        setIsFollowing(false);
      } else {
        closeOverlays();
        setIsFollowing(true);
      }
    } else {
      closeOverlays();
      startTracking();
      setIsFollowing(true);
    }
  };

  // Handle watchPosition when tracking starts
  useEffect(() => {
    if (!isTracking || !map || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        updateMarker(location);

        if (isFollowing && map) {
          map.setCenter(location);
        }
      },
      (error) => {
        console.error('Tracking error:', error);
        stopTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, isFollowing, map]);

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


  if (!map) return null;

  return (
    <div className="absolute bottom-24 right-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
        <button
          onClick={handleMyLocationClick}
          className={`w-8 h-8 bg-transparent ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} border-none rounded-md cursor-pointer text-[var(--foreground)] flex items-center justify-center font-bold text-lg select-none`}
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