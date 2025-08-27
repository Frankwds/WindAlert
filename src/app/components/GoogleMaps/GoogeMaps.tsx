'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';

interface GoogleMapsProps {
  className?: string;
}

const GoogeMapsDynamic: React.FC<GoogleMapsProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Import paragliding locations from mock data
  const paraglidingLocations: ParaglidingLocation[] = [
    {
      id: '1',
      name: 'Grøtterud',
      description: 'Elevation: 350m, Wind directions: SW, S, SE',
      longitude: 9.998056,
      latitude: 59.504722,
      altitude: 350,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Brudeberget',
      description: 'Elevation: 560m, Wind directions: N, NE',
      longitude: 9.823869,
      latitude: 59.494864,
      altitude: 560,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Sundvollen',
      description: 'Elevation: 380m, Wind directions: NW, W, N',
      longitude: 10.3225,
      latitude: 60.053889,
      altitude: 380,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'Liaset',
      description: 'Elevation: 650m, Wind directions: NW, N, SW, W',
      longitude: 6.521389,
      latitude: 60.703333,
      altitude: 650,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      name: 'Hangur',
      description: 'Elevation: 660m, Wind directions: SW, S, SE',
      longitude: 6.403056,
      latitude: 60.638889,
      altitude: 660,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      name: 'Salknappen',
      description: 'Elevation: 1250m, Wind directions: SW, S, SE',
      longitude: 9.245278,
      latitude: 61.900278,
      altitude: 1250,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      name: 'Stokkelia',
      description: 'Elevation: 350m, Wind directions: NE, E',
      longitude: 10.040806,
      latitude: 59.556722,
      altitude: 350,
      country: 'Norway',
      flightlog_id: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Add weather stations from stationsCoordinates.txt
  const weatherStations: WeatherStation[] = [
    {
      id: '107',
      station_id: '107',
      name: 'Weather Station 107',
      longitude: 6.40708,
      latitude: 60.64548,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '112',
      station_id: '112',
      name: 'Weather Station 112',
      longitude: 6.129212,
      latitude: 60.409995,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '115',
      station_id: '115',
      name: 'Weather Station 115',
      longitude: 7.75935,
      latitude: 63.05126,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '119',
      station_id: '119',
      name: 'Weather Station 119',
      longitude: 9.8244,
      latitude: 59.494,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '118',
      station_id: '118',
      name: 'Weather Station 118',
      longitude: 6.41679,
      latitude: 60.62697,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '120',
      station_id: '120',
      name: 'Weather Station 120',
      longitude: 10.032084,
      latitude: 60.389455,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '121',
      station_id: '121',
      name: 'Weather Station 121',
      longitude: 6.4683,
      latitude: 60.85876,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '124',
      station_id: '124',
      name: 'Weather Station 124',
      longitude: 9.9996,
      latitude: 59.504,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '131',
      station_id: '131',
      name: 'Weather Station 131',
      longitude: 6.51885,
      latitude: 60.70111,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '133',
      station_id: '133',
      name: 'Weather Station 133',
      longitude: 8.61783,
      latitude: 60.7993,
      altitude: 0,
      country: 'Norway',
      region: null,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Helper functions for creating markers
  const createParaglidingMarker = (location: ParaglidingLocation, mapInstance: google.maps.Map) => {
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        background: #FF6B6B; 
        border: 2px solid white; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-weight: bold; 
        font-size: 12px; 
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        P
      </div>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: location.latitude, lng: location.longitude },
      map: mapInstance,
      title: location.name,
      content: markerElement
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-bold text-lg mb-2">${location.name}</h3>
          <p class="text-sm text-gray-600 mb-2">🪂 Paragliding Spot</p>
          ${location.description ? `<p class="text-sm">${location.description}</p>` : ''}
          <div class="mt-3 text-xs text-gray-500">
            <p>Lat: ${location.latitude.toFixed(4)}°</p>
            <p>Lng: ${location.longitude.toFixed(4)}°</p>
            <p>Altitude: ${location.altitude}m</p>
            <p>Country: ${location.country}</p>
          </div>
        </div>
      `
    });

    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });

    return marker;
  };

  const createWeatherStationMarker = (location: WeatherStation, mapInstance: google.maps.Map) => {
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        background: #4ECDC4; 
        border: 2px solid white; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-weight: bold; 
        font-size: 12px; 
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        W
      </div>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: location.latitude!, lng: location.longitude! },
      map: mapInstance,
      title: location.name,
      content: markerElement
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3">
          <h3 class="font-bold text-lg mb-2">${location.name}</h3>
          <p class="text-sm text-gray-600 mb-2">🌤️ Weather Station</p>
          <div class="mt-3 text-xs text-gray-500">
            <p>Station ID: ${location.station_id}</p>
            <p>Lat: ${location.latitude?.toFixed(4)}°</p>
            <p>Lng: ${location.longitude?.toFixed(4)}°</p>
            <p>Altitude: ${location.altitude}m</p>
            <p>Country: ${location.country || 'Unknown'}</p>
            ${location.region ? `<p>Region: ${location.region}</p>` : ''}
          </div>
        </div>
      `
    });

    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });

    return marker;
  };

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

        // Add paragliding markers
        paraglidingLocations.forEach(location => {
          createParaglidingMarker(location, mapInstance);
        });

        // Add weather station markers
        weatherStations.forEach(location => {
          createWeatherStationMarker(location, mapInstance);
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
          Explore paragliding locations and weather stations across Norway
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
        <p className="text-[var(--foreground)]/50 text-xs">7 paragliding + 10 weather stations</p>
      </div>
    </div>
  );
};

export default GoogeMapsDynamic;
