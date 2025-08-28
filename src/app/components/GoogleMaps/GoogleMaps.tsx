'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { createAllMarkers } from './MarkerSetup';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { MapLayerToggle } from './MapLayerToggle';
import { ZoomControls } from './ZoomControls';
import { Clusterer } from './clusterer';
import { getParaglidingInfoWindowContent, getWeatherStationInfoWindowContent } from './InfoWindows';
import { ParaglidingClusterRenderer, WeatherStationClusterRenderer } from './clusterer/Renderers';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 60.5, lng: 8.5 },
  DEFAULT_ZOOM: 7,
  MAP_ID: 'WindLordMapID'
} as const;

const CLUSTERER_CONFIG = {
  RADIUS: 60,
  MAX_ZOOM: 15,
  MIN_POINTS: 2
} as const;

const GoogleMaps: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);

  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);

  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  const openInfoWindow = useCallback((marker: google.maps.marker.AdvancedMarkerElement, content: string) => {
    if (infoWindowRef.current && mapInstance) {
      closeInfoWindow();
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(mapInstance, marker);
    }
  }, [mapInstance, closeInfoWindow]);

  const loadAllMarkers = async () => {
    try {
      setIsLoadingMarkers(true);

      const [paraglidingLocations, weatherStations] = await Promise.all([
        ParaglidingLocationService.getAllActiveForMarkers(),
        WeatherStationService.getAllActiveForMarkers()
      ]);

      const { paraglidingMarkers, weatherStationMarkers } = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => {
          const content = 'station_id' in location
            ? getWeatherStationInfoWindowContent(location)
            : getParaglidingInfoWindowContent(location);
          openInfoWindow(marker, content);
        }
      });

      setParaglidingMarkers(paraglidingMarkers);
      setWeatherStationMarkers(weatherStationMarkers);
    } catch (err) {
      console.error('Error loading all markers:', err);
    } finally {
      setIsLoadingMarkers(false);
    }
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

        const map = new google.maps.Map(mapRef.current, {
          center: MAP_CONFIG.DEFAULT_CENTER,
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapId: MAP_CONFIG.MAP_ID,
          streetViewControl: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          scrollwheel: true
        });

        infoWindowRef.current = new google.maps.InfoWindow();

        map.addListener('click', closeInfoWindow);

        setMapInstance(map);
        setIsLoading(false);

      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();

  }, []);

  useEffect(() => {
    if (mapInstance) {
      loadAllMarkers();
    }
  }, [mapInstance]);

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load map"
        showRetry={false}
      />
    );
  }

  return (
    <div className={`w-full h-full`}>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner size="lg" text="Loading map..." overlay />}
        {isLoadingMarkers && !isLoading && (
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-700">Loading markers...</span>
            </div>
          </div>
        )}

        {/* Marker count display */}
        {!isLoading && !isLoadingMarkers && (
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="text-sm text-gray-700">
              <div className="text-xs text-gray-500">
                {paraglidingMarkers.length} paragliding spots
              </div>
              <div className="text-xs text-gray-500">
                {weatherStationMarkers.length} weather stations
              </div>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {/* Render clusterers only when we have markers and map */}
        {mapInstance && paraglidingMarkers.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={paraglidingMarkers}
            renderer={new ParaglidingClusterRenderer()}
            algorithmOptions={{
              radius: CLUSTERER_CONFIG.RADIUS,
              maxZoom: CLUSTERER_CONFIG.MAX_ZOOM,
              minPoints: CLUSTERER_CONFIG.MIN_POINTS
            }}
          />
        )}

        {mapInstance && weatherStationMarkers.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={weatherStationMarkers}
            renderer={new WeatherStationClusterRenderer()}
            algorithmOptions={{
              radius: CLUSTERER_CONFIG.RADIUS,
              maxZoom: CLUSTERER_CONFIG.MAX_ZOOM,
              minPoints: CLUSTERER_CONFIG.MIN_POINTS
            }}
          />
        )}

        {mapInstance && (
          <>
            <MapLayerToggle map={mapInstance} />
            <ZoomControls map={mapInstance} />
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleMaps;
