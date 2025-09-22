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

  const createMarkerElement = () => {
    const markerElement = document.createElement('div');
    markerElement.style.transform = 'translate(0%, 50%)';
    markerElement.innerHTML = `
      <div style="
        position: relative; 
        width: 24px; 
        height: 24px;
        transition: transform 0.3s ease-out;
      ">
        <img 
          src="/paragliderBlue.png" 
          alt="My Location" 
          style="
            width: 24px;
            height: 24px;
            filter: drop-shadow(-2px -2px 3px rgba(0,0,0,0.6)) drop-shadow(-2px -2px 2px rgba(0,0,0,0.4));
          "
        />
        <div class="heading-arrow" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(8px, -50%);
          width: 16px;
          height: 16px;
          display: none;
        "></div>
      </div>
    `;
    return markerElement;
  };

  const updateMyLocation = (heading: number | null) => {
    if (!markerRef.current) return;

    const markerElement = markerRef.current.content as HTMLElement;
    const containerDiv = markerElement.querySelector('div[style*="position: relative"]') as HTMLElement;
    const arrowContainer = markerElement.querySelector('div.heading-arrow') as HTMLElement;

    if (!containerDiv || !arrowContainer) return;

    if (heading !== null) {
      // Show arrow
      arrowContainer.style.display = 'block';

      // Update rotation
      containerDiv.style.transform = `rotate(${heading - 90}deg)`;

      // Update SVG
      const existingSvg = arrowContainer.querySelector('svg');
      if (existingSvg) existingSvg.remove();

      const svgArrow = createHeadingArrowSVG(false, '#3b82f6');
      svgArrow.style.width = '16px';
      svgArrow.style.height = '16px';
      arrowContainer.appendChild(svgArrow);
    } else {
      // Hide arrow
      arrowContainer.style.display = 'none';

      // Reset rotation
      containerDiv.style.transform = 'rotate(0deg)';
    }
  };

  const updateMarker = (location: { lat: number; lng: number }, heading: number | null) => {
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.position = location;
    } else {
      const markerElement = createMarkerElement();
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        position: location,
        map,
        title: 'My Location',
        content: markerElement,
      });
    }

    updateMyLocation(heading);
  };

  const createHeadingArrowSVG = (isClustered: boolean, color: string = '#d8d8d8') => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '42');
    svg.setAttribute('height', '42');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.style.transform = `rotate(90deg)${isClustered ? 'scale(0.8)' : ''}`;
    svg.style.transformOrigin = 'center';
    svg.style.transition = 'transform 0.2s ease-in-out';

    // Clean heading arrow based on the provided SVG
    // Scaled and centered for 24x24 viewBox
    const headingArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    headingArrow.setAttribute('d', 'M12 2 L4 20 L11 16 L13 16 L20 20 L12 2 Z');
    headingArrow.setAttribute('fill', color);
    headingArrow.setAttribute('stroke', 'black');
    headingArrow.setAttribute('stroke-width', isClustered ? '0.8' : '0.5');
    headingArrow.setAttribute('stroke-linecap', 'round');
    svg.appendChild(headingArrow);

    return svg;
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

        // Extract heading from position
        const newHeading = position.coords.heading;
        updateMarker(location, newHeading);

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
            (isFollowing ? "Follow location (Right-click to clear cache)" : "Follow location (Right-click to clear cache)")
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