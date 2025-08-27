'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { createAllMarkers, clearAllMarkers } from './MarkerManager';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { ParaglidingLocation, WeatherStation } from '@/lib/supabase/types';
import { MapLayerToggle } from './MapLayerToggle';
import { ZoomControls } from './ZoomControls';

interface GoogleMapsProps {
  className?: string;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [currentMarkers, setCurrentMarkers] = useState<{
    paragliding: ParaglidingLocation[];
    weatherStations: WeatherStation[];
  }>({ paragliding: [], weatherStations: [] });
  const [totalCounts, setTotalCounts] = useState<{
    paragliding: number;
    weatherStations: number;
  }>({ paragliding: 0, weatherStations: 0 });

  // Function to load total counts (run once on mount)
  const loadTotalCounts = useCallback(async () => {
    try {
      const [paraglidingCount, weatherStationsCount] = await Promise.all([
        ParaglidingLocationService.getCount(),
        WeatherStationService.getCount()
      ]);

      setTotalCounts({
        paragliding: paraglidingCount,
        weatherStations: weatherStationsCount
      });
    } catch (err) {
      console.error('Error loading total counts:', err);
    }
  }, []);

  // Function to load markers within current map bounds
  const loadMarkersInBounds = useCallback(async (map: google.maps.Map) => {
    try {
      setIsLoadingMarkers(true);
      const bounds = map.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // Add some padding to avoid markers disappearing at edges
      const padding = 0.1; // 10% padding
      const latPadding = (ne.lat() - sw.lat()) * padding;
      const lngPadding = (ne.lng() - sw.lng()) * padding;

      const north = ne.lat() + latPadding;
      const south = sw.lat() - latPadding;
      const east = ne.lng() + lngPadding;
      const west = sw.lng() - lngPadding;

      // Fetch data from both services concurrently
      const [paraglidingLocations, weatherStations] = await Promise.all([
        ParaglidingLocationService.getWithinBounds(north, south, east, west),
        WeatherStationService.getWithinBounds(north, south, east, west)
      ]);

      // Clear existing markers
      clearAllMarkers();

      // Create new markers
      createAllMarkers({
        paraglidingLocations,
        weatherStations,
        mapInstance: map
      });

      setCurrentMarkers({ paragliding: paraglidingLocations, weatherStations });
    } catch (err) {
      console.error('Error loading markers in bounds:', err);
    } finally {
      setIsLoadingMarkers(false);
    }
  }, []);

  // Debounced function to avoid too many API calls
  const debouncedLoadMarkers = useCallback(
    debounce((map: google.maps.Map) => loadMarkersInBounds(map), 300),
    [loadMarkersInBounds]
  );

  // Function to handle map idle (when user stops moving/zooming)
  const handleMapIdle = useCallback((map: google.maps.Map) => {
    debouncedLoadMarkers(map);
  }, [debouncedLoadMarkers]);

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

        // Load initial markers
        await loadMarkersInBounds(map);

        // Load total counts
        loadTotalCounts();

        // Use 'idle' event instead of 'bounds_changed' for better performance
        // This fires when the user stops moving/zooming the map
        map.addListener('idle', () => {
          handleMapIdle(map);
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();
  }, [loadMarkersInBounds, handleMapIdle, loadTotalCounts]);

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
              <div className="font-medium">Current View</div>
              <div className="text-xs text-gray-500">
                {currentMarkers.paragliding.length} of {totalCounts.paragliding} paragliding spots
              </div>
              <div className="text-xs text-gray-500">
                {currentMarkers.weatherStations.length} of {totalCounts.weatherStations} weather stations
              </div>
              {totalCounts.paragliding > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  Showing {((currentMarkers.paragliding.length + currentMarkers.weatherStations.length) / (totalCounts.paragliding + totalCounts.weatherStations) * 100).toFixed(1)}% of total
                </div>
              )}
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

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

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default GoogleMaps;
