'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsProps {
  className?: string;
}

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'paragliding' | 'weather-station';
  description?: string;
}

const GoogeMapsDynamic: React.FC<GoogleMapsProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample data - in a real app, this would come from your API
  const sampleLocations: MapLocation[] = [
    {
      id: '1',
      name: 'Sample Paragliding Spot',
      lat: 47.3769,
      lng: 8.5417,
      type: 'paragliding',
      description: 'Popular paragliding location in Switzerland'
    },
    {
      id: '2',
      name: 'Weather Station Alpha',
      lat: 47.3782,
      lng: 8.5395,
      type: 'weather-station',
      description: 'Local weather monitoring station'
    }
  ];

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
          libraries: ['places']
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 59.494864, lng: 9.823869 }, // Default center (Switzerland)
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.HYBRID,
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

        // Add markers for each location
        sampleLocations.forEach(location => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstance,
            title: location.name,
            icon: {
              url: location.type === 'paragliding'
                ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#FF6B6B" stroke="#FFF" stroke-width="2"/>
                      <text x="16" y="20" text-anchor="middle" fill="#FFF" font-size="12" font-weight="bold">P</text>
                    </svg>
                  `)
                : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#4ECDC4" stroke="#FFF" stroke-width="2"/>
                      <text x="16" y="20" text-anchor="middle" fill="#FFF" font-size="12" font-weight="bold">W</text>
                    </svg>
                  `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16)
            }
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3">
                <h3 class="font-bold text-lg mb-2">${location.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${location.type === 'paragliding' ? '🪂 Paragliding Spot' : '🌤️ Weather Station'}</p>
                ${location.description ? `<p class="text-sm">${location.description}</p>` : ''}
                <div class="mt-3 text-xs text-gray-500">
                  <p>Lat: ${location.lat.toFixed(4)}°</p>
                  <p>Lng: ${location.lng.toFixed(4)}°</p>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
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
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Failed to load map</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Interactive Map
        </h2>
        <p className="text-[var(--foreground)]/70 text-sm">
          Explore paragliding locations and weather stations
        </p>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-2"></div>
              <p className="text-[var(--foreground)]/70">Loading map...</p>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg shadow-lg border border-gray-200"
          style={{ minHeight: '400px' }}
        />
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm text-[var(--foreground)]/70">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Paragliding Spots</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
          <span>Weather Stations</span>
        </div>
      </div>
    </div>
  );
};

export default GoogeMapsDynamic;
