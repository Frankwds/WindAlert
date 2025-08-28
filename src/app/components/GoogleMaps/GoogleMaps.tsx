'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { createAllMarkers, setupMarkerClickHandlers } from './MarkerSetup';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { ParaglidingLocation, WeatherStation } from '@/lib/supabase/types';
import { MapLayerToggle } from './MapLayerToggle';
import { ZoomControls } from './ZoomControls';
import { Clusterer, WeatherStationClusterRenderer, ParaglidingClusterRenderer } from './clusterer';

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

interface MapState {
  markers: {
    paragliding: google.maps.marker.AdvancedMarkerElement[];
    weatherStations: google.maps.marker.AdvancedMarkerElement[];
  };
  data: {
    paragliding: ParaglidingLocation[];
    weatherStations: WeatherStation[];
  };
  counts: {
    paragliding: number;
    weatherStations: number;
  };
}

const GoogleMaps: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);

  const [mapState, setMapState] = useState<MapState>({
    markers: { paragliding: [], weatherStations: [] },
    data: { paragliding: [], weatherStations: [] },
    counts: { paragliding: 0, weatherStations: 0 }
  });

  // Computed property to check if everything is ready
  const isMapReady = useMemo(() =>
    mapInstance &&
    mapState.markers.paragliding.length > 0 &&
    mapState.markers.weatherStations.length > 0 &&
    mapState.data.paragliding.length > 0 &&
    mapState.data.weatherStations.length > 0,
    [mapInstance, mapState]
  );

  // Function to set up click handlers for markers
  const setupClickHandlers = useCallback(() => {
    if (isMapReady) {
      setupMarkerClickHandlers(
        mapState.markers.paragliding,
        mapState.data.paragliding,
        mapInstance!,
        true
      );
      setupMarkerClickHandlers(
        mapState.markers.weatherStations,
        mapState.data.weatherStations,
        mapInstance!,
        false
      );
    }
  }, [isMapReady, mapState, mapInstance]);

  // Function to load all markers once on mount
  const loadAllMarkers = useCallback(async () => {
    try {
      setIsLoadingMarkers(true);

      // Fetch all data concurrently
      const [paraglidingLocations, weatherStations] = await Promise.all([
        ParaglidingLocationService.getAllActiveWithCoordinates(),
        WeatherStationService.getAllActiveWithCoordinates()
      ]);

      // Create all markers (IMPORTANT: don't set map property yet)
      // The MarkerClusterer will manage their visibility
      const { paraglidingMarkers, weatherStationMarkers } = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        mapInstance: null // Don't assign to map yet
      });

      // Update consolidated state
      setMapState({
        markers: { paragliding: paraglidingMarkers, weatherStations: weatherStationMarkers },
        data: { paragliding: paraglidingLocations, weatherStations: weatherStations },
        counts: {
          paragliding: paraglidingLocations.length,
          weatherStations: weatherStations.length
        }
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

  // Set up click handlers when everything is ready
  useEffect(() => {
    if (isMapReady) {
      setupClickHandlers();
    }
  }, [isMapReady, setupClickHandlers]);

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
                {mapState.counts.paragliding} paragliding spots
              </div>
              <div className="text-xs text-gray-500">
                {mapState.counts.weatherStations} weather stations
              </div>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {/* Render clusterers only when we have markers and map */}
        {mapInstance && mapState.markers.paragliding.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={mapState.markers.paragliding}
            renderer={new ParaglidingClusterRenderer()}
            algorithmOptions={{
              radius: CLUSTERER_CONFIG.RADIUS,
              maxZoom: CLUSTERER_CONFIG.MAX_ZOOM,
              minPoints: CLUSTERER_CONFIG.MIN_POINTS
            }}
          />
        )}

        {mapInstance && mapState.markers.weatherStations.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={mapState.markers.weatherStations}
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
