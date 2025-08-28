'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { createAllMarkers, setupMarkerClickHandlers } from './MarkerManager';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { ParaglidingLocation, WeatherStation } from '@/lib/supabase/types';
import { MapLayerToggle } from './MapLayerToggle';
import { ZoomControls } from './ZoomControls';
import { Clusterer, WeatherStationClusterRenderer, ParaglidingClusterRenderer } from './clusterer';

interface GoogleMapsProps {
  className?: string;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markers, setMarkers] = useState<{
    paragliding: google.maps.marker.AdvancedMarkerElement[];
    weatherStations: google.maps.marker.AdvancedMarkerElement[];
  }>({ paragliding: [], weatherStations: [] });
  const [locationData, setLocationData] = useState<{
    paragliding: ParaglidingLocation[];
    weatherStations: WeatherStation[];
  }>({ paragliding: [], weatherStations: [] });
  const [totalCounts, setTotalCounts] = useState<{
    paragliding: number;
    weatherStations: number;
  }>({ paragliding: 0, weatherStations: 0 });

  // Function to set up click handlers for markers
  const setupClickHandlers = useCallback(() => {
    if (mapInstance && markers.paragliding.length > 0 && markers.weatherStations.length > 0) {
      setupMarkerClickHandlers(
        markers.paragliding,
        locationData.paragliding,
        mapInstance,
        true
      );
      setupMarkerClickHandlers(
        markers.weatherStations,
        locationData.weatherStations,
        mapInstance,
        false
      );
    }
  }, [mapInstance, markers, locationData]);

  // Function to load all markers once on mount
  const loadAllMarkers = useCallback(async () => {
    try {
      setIsLoadingMarkers(true);

      // Fetch all data concurrently
      const [paraglidingLocations, weatherStations] = await Promise.all([
        ParaglidingLocationService.getAllActiveWithCoordinates(),
        WeatherStationService.getAllActiveWithCoordinates()
      ]);

      // Store location data for later use
      setLocationData({ paragliding: paraglidingLocations, weatherStations });

      // Create all markers (IMPORTANT: don't set map property yet)
      // The MarkerClusterer will manage their visibility
      const { paraglidingMarkers, weatherStationMarkers } = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        mapInstance: null // Don't assign to map yet
      });

      setMarkers({ paragliding: paraglidingMarkers, weatherStations: weatherStationMarkers });
      setTotalCounts({
        paragliding: paraglidingLocations.length,
        weatherStations: weatherStations.length
      });
    } catch (err) {
      console.error('Error loading all markers:', err);
    } finally {
      setIsLoadingMarkers(false);
    }
  }, []); // No dependencies needed

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
          center: { lat: 60.5, lng: 8.5 },
          zoom: 7,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapId: 'WindLordMapID',
          streetViewControl: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          scrollwheel: true
        });

        setMapInstance(map);
        setIsLoading(false);

        // Load markers after map is initialized
        await loadAllMarkers();
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();
  }, []); // No dependencies

  // Set up click handlers when both map and markers are ready
  useEffect(() => {
    if (mapInstance && markers.paragliding.length > 0 && markers.weatherStations.length > 0 &&
      locationData.paragliding.length > 0 && locationData.weatherStations.length > 0) {
      setupClickHandlers();
    }
  }, [mapInstance, markers, locationData, setupClickHandlers]);

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load map"
        className={className}
        showRetry={false}
      />
    );
  }

  return (
    <div className={`w-full h-full ${className}`}>
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
                {totalCounts.paragliding} paragliding spots
              </div>
              <div className="text-xs text-gray-500">
                {totalCounts.weatherStations} weather stations
              </div>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {/* Render clusterers only when we have markers and map */}
        {mapInstance && markers.paragliding.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={markers.paragliding}
            renderer={new ParaglidingClusterRenderer()}
            algorithmOptions={{
              radius: 60,
              maxZoom: 15,
              minPoints: 2
            }}
          />
        )}

        {mapInstance && markers.weatherStations.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={markers.weatherStations}
            renderer={new WeatherStationClusterRenderer()}
            algorithmOptions={{
              radius: 60,
              maxZoom: 15,
              minPoints: 2
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
