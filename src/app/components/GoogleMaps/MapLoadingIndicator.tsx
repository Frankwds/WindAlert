import React, { useEffect, useRef } from 'react';
import { createParaglidingMarkerElementWithDirection, createWeatherStationClusterElement } from '../shared/Markers';

interface MapLoadingIndicatorProps {
  isLoadingParagliding: boolean;
  isLoadingWeatherStations: boolean;
}

export const MapLoadingIndicator: React.FC<MapLoadingIndicatorProps> = ({
  isLoadingParagliding,
  isLoadingWeatherStations,
}) => {
  const paraglidingIconRef = useRef<HTMLDivElement>(null);
  const weatherStationIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create paragliding marker icon
    if (paraglidingIconRef.current && isLoadingParagliding) {
      const paraglidingElement = createParaglidingMarkerElementWithDirection();
      paraglidingElement.style.transform = 'scale(0.7)'; // Make it smaller for the indicator
      paraglidingIconRef.current.appendChild(paraglidingElement);
    }

    // Create weather station marker icon
    if (weatherStationIconRef.current && isLoadingWeatherStations) {
      const weatherStationElement = createWeatherStationClusterElement(2, 270);
      weatherStationElement.style.transform = 'scale(0.7)'; // Make it smaller for the indicator
      weatherStationIconRef.current.appendChild(weatherStationElement);
    }

    // Cleanup function
    return () => {
      if (paraglidingIconRef.current) {
        paraglidingIconRef.current.innerHTML = '';
      }
      if (weatherStationIconRef.current) {
        weatherStationIconRef.current.innerHTML = '';
      }
    };
  }, [isLoadingParagliding, isLoadingWeatherStations]);

  // Don't render if nothing is loading
  if (!isLoadingParagliding && !isLoadingWeatherStations) {
    return null;
  }

  return (
    <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20'>
      <div className='bg-white/5 backdrop-blur-sm rounded-lg flex items-center gap-2 text-sm font-medium text-gray-700'>
        {/* Paragliding icon */}
        {isLoadingParagliding && <div ref={paraglidingIconRef} className='flex items-center justify-center' />}

        {/* Weather station icon */}
        {isLoadingWeatherStations && <div ref={weatherStationIconRef} className='flex items-center justify-center' />}

        {/* Loading text */}
        <span>Laster...</span>
      </div>
    </div>
  );
};
