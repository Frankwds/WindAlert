'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { createAllMarkers } from './MarkerSetup';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { MapLayerToggle, ZoomControls, MyLocation, FilterControl, WindFilterCompass } from '@/app/components/GoogleMaps/mapControls';
import { Clusterer } from './clusterer';
import { getParaglidingInfoWindow, getWeatherStationInfoWindowContent } from './InfoWindows';
import { ParaglidingClusterRenderer, WeatherStationClusterRenderer } from './clusterer/Renderers';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import { createRoot } from 'react-dom/client';
import { fetchYrData } from '@/lib/yr/apiClient';
import { mapYrData } from '@/lib/yr/mapping';
import { useInfoWindowStyles } from './useInfoWindowStyles';

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
  useInfoWindowStyles();

  const mapRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);

  const [showParaglidingMarkers, setShowParaglidingMarkers] = useState(true);
  const [showWeatherStationMarkers, setShowWeatherStationMarkers] = useState(true);
  const [selectedWindDirections, setSelectedWindDirections] = useState<string[]>([]);

  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  const openInfoWindow = useCallback((marker: google.maps.marker.AdvancedMarkerElement, content: string | HTMLElement) => {
    if (infoWindowRef.current && mapInstance) {
      closeInfoWindow();
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(mapInstance, marker);
    }
  }, [mapInstance, closeInfoWindow]);

  const filterParaglidingMarkersByWindDirection = (markers: google.maps.marker.AdvancedMarkerElement[], windDirections: string[]) => {
    if (windDirections.length === 0) return markers; // Show all paragliding if none selected

    return markers.filter(marker => {
      const locationData = (marker as any).locationData as ParaglidingMarkerData;
      return windDirections.some(direction => locationData[direction.toLowerCase() as keyof ParaglidingMarkerData]);
    });
  };

  const handleWindDirectionChange = useCallback((directions: string[]) => {
    setSelectedWindDirections(directions);
  }, []);

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    if (mapInstance) {
      mapInstance.setCenter(location);
      mapInstance.setZoom(14); // Zoom in to the user's location

      // Remove the old marker
      if (userLocationMarker) {
        userLocationMarker.setMap(null);
      }

      // Create a new marker for the user's location (the "blue dot")
      const blueDotIcon = {
        path: 'M -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 1,
      };

      const marker = new google.maps.Marker({
        position: location,
        map: mapInstance,
        icon: blueDotIcon,
        title: 'My Location',
      });

      setUserLocationMarker(marker);
    }
  };

  const loadAllMarkers = async () => {
    try {

      const [paraglidingLocations, weatherStations] = await Promise.all([
        ParaglidingLocationService.getAllActiveForMarkers(),
        WeatherStationService.getNordicCountriesForMarkers()
      ]);

      const { paraglidingMarkers, weatherStationMarkers } = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        onMarkerClick: async (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => {
          if ('station_id' in location) {
            const content = getWeatherStationInfoWindowContent(location);
            openInfoWindow(marker, content);
          } else {
            const infoWindowContent = document.createElement('div');
            const root = createRoot(infoWindowContent);

            // Initial render with loading state
            root.render(<LoadingSpinner size="md" text="Loading weather..." />);
            openInfoWindow(marker, infoWindowContent);

            try {
              const yrData = await fetchYrData(location.latitude, location.longitude);
              const mappedData = mapYrData(yrData);

              const locationWithWeather = {
                ...location,
                weatherData: mappedData.weatherDataYr1h,
              };

              root.render(getParaglidingInfoWindow(locationWithWeather));
            } catch (error) {
              console.error('Failed to fetch weather data:', error);
              root.render(<div>Failed to load weather data.</div>);
            }
          }
        }
      });

      setParaglidingMarkers(paraglidingMarkers);
      setWeatherStationMarkers(weatherStationMarkers);
    } catch (err) {
      console.error('Error loading all markers:', err);
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
          mapTypeId: google.maps.MapTypeId.TERRAIN,
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

        <div
          ref={mapRef}
          className="w-full h-full"
        />

        {mapInstance && paraglidingMarkers.length > 0 && (
          <Clusterer
            map={mapInstance}
            markers={showParaglidingMarkers ? filterParaglidingMarkersByWindDirection(paraglidingMarkers, selectedWindDirections) : []}
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
            markers={showWeatherStationMarkers ? weatherStationMarkers : []}
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
            <MyLocation map={mapInstance} onLocationUpdate={handleLocationUpdate} />
            <FilterControl
              onParaglidingFilterChange={setShowParaglidingMarkers}
              onWeatherStationFilterChange={setShowWeatherStationMarkers}
            />
            <WindFilterCompass onWindDirectionChange={handleWindDirectionChange} selectedDirections={selectedWindDirections} />
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleMaps;
