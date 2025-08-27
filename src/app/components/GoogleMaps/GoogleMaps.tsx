'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import {
  MapLegend,
  LoadingSpinner,
  ErrorDisplay,
  createAllMarkers,
  paraglidingLocations,
  weatherStations
} from './index';

interface GoogleMapsProps {
  className?: string;
}

const GoogeMapsDynamic: React.FC<GoogleMapsProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'GOOGLE_MAPS_API_KEY') {
          throw new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 60.5, lng: 8.5 }, // Center on Norway
          zoom: 7,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapId: 'DEMO_MAP_ID', // Required for advanced markers
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false, // Make POIs non-clickable
          scrollwheel: true,
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }]
            },
          ]
        });

        setMap(mapInstance);

        // Create all markers using our MarkerManager
        createAllMarkers({
          paraglidingLocations,
          weatherStations,
          mapInstance
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  if (error) {
    return <ErrorDisplay error={error} className={className} />;
  }

  return (
    <div className={`w-full ${className}`}>

      <div className="relative">
        {isLoading && <LoadingSpinner />}

        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg shadow-lg border border-gray-200"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

export default GoogeMapsDynamic;
