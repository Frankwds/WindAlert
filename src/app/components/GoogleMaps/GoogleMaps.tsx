'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { createAllMarkers } from './MarkerSetup';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { MapLayerToggle, ZoomControls, MyLocation, FilterControl, WindFilterCompass } from '@/app/components/GoogleMaps/mapControls';
import PromisingFilter from './mapControls/PromisingFilter';
import { Clusterer } from './clusterer';
import { getParaglidingInfoWindow, getWeatherStationInfoWindowContent } from './InfoWindows';
import { ParaglidingClusterRenderer, WeatherStationClusterRenderer } from './clusterer/Renderers';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import { createRoot } from 'react-dom/client';
import { useInfoWindowStyles } from './useInfoWindowStyles';
import { dataCache } from '@/lib/data-cache';

const MAP_STATE_KEY = 'windlordMapState';

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(MAP_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Basic validation
        if (parsedState.center && typeof parsedState.zoom === 'number') {
          return parsedState;
        }
      } catch (e) {
        console.error('Could not parse map state from local storage', e);
        return null;
      }
    }
  }
  return null;
};

const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 60.5, lng: 8.5 },
  DEFAULT_ZOOM: 5,
  MAP_ID: 'WindLordMapID'
} as const;

const CLUSTERER_CONFIG = {
  RADIUS: 60,
  MAX_ZOOM: 15,
  MIN_POINTS: 2
} as const;

const GoogleMaps: React.FC = () => {
  useInfoWindowStyles();

  const [initialMapState] = useState(getInitialState);

  const mapRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);

  const [showParaglidingMarkers, setShowParaglidingMarkers] = useState(
    initialMapState?.showParaglidingMarkers ?? true
  );
  const [showWeatherStationMarkers, setShowWeatherStationMarkers] = useState(
    initialMapState?.showWeatherStationMarkers ?? true
  );
  const [selectedWindDirections, setSelectedWindDirections] = useState<string[]>(
    initialMapState?.selectedWindDirections ?? []
  );
  const [windFilterExpanded, setWindFilterExpanded] = useState(false);
  const [windFilterAndOperator, setWindFilterAndOperator] = useState<boolean>(
    initialMapState?.windFilterAndOperator ?? true
  );
  const [promisingFilter, setPromisingFilter] = useState<{
    selectedDay: number;
    selectedTimeRange: [number, number];
    minPromisingHours: number;
  } | null>(null);
  const [isPromisingFilterExpanded, setIsPromisingFilterExpanded] = useState(false);

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

  /**
   * Filters paragliding markers based on promising weather conditions
   * @param markers - Array of Google Maps AdvancedMarkerElement objects
   * @returns Filtered array containing only markers with promising weather
   */
  const filterParaglidingMarkersByPromising = (markers: google.maps.marker.AdvancedMarkerElement[]) => {
    // If no promising filter is set, return all markers unchanged
    if (!promisingFilter) return markers;

    return markers.filter(marker => {
      const locationData = (marker as any).locationData as ParaglidingMarkerData;
      const forecast = locationData.forecast_cache;

      if (!forecast) return false;

      const { selectedDay, selectedTimeRange, minPromisingHours } = promisingFilter;

      // Calculate the target date based on day offset
      const dayOffset = selectedDay === 0 ? 0 : selectedDay === 1 ? 1 : 2;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      // Set start and end times based on the filter's time range
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(selectedTimeRange[0]);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(selectedTimeRange[1]);

      // Count how many hours in the specified time range are promising
      let promisingHours = 0;
      for (const f of forecast) {
        const forecastTime = new Date(f.time);
        if (forecastTime >= startOfDay && forecastTime < endOfDay && f.is_promising) {
          promisingHours++;
        }
      }

      return promisingHours >= minPromisingHours;
    });
  }

  const filterParaglidingMarkersByWindDirection = (markers: google.maps.marker.AdvancedMarkerElement[], windDirections: string[]) => {
    if (windDirections.length === 0) return markers;

    return markers.filter(marker => {
      const locationData = (marker as any).locationData as ParaglidingMarkerData;
      if (windFilterAndOperator) {
        return windDirections.every(direction => locationData[direction.toLowerCase() as keyof ParaglidingMarkerData]);
      } else {
        return windDirections.some(direction => locationData[direction.toLowerCase() as keyof ParaglidingMarkerData]);
      }
    });
  };

  const handleWindDirectionChange = useCallback((directions: string[]) => {
    setSelectedWindDirections(directions);
  }, []);

  const handleWindFilterLogicChange = useCallback(() => {
    setWindFilterAndOperator(prev => !prev);
  }, []);

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    if (mapInstance) {
      const shouldCenterMap = userLocationMarker !== null;

      if (shouldCenterMap) {
        mapInstance.setCenter(location);
        mapInstance.setZoom(12);
      }

      if (userLocationMarker) {
        userLocationMarker.setMap(null);
      }

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

  const loadAllMarkers = useCallback(async () => {
    try {
      let paraglidingLocations = dataCache.getParaglidingLocations();
      let weatherStations = dataCache.getWeatherStations();

      if (!paraglidingLocations || !weatherStations) {
        const [fetchedParaglidingLocations, fetchedWeatherStations] = await Promise.all([
          ParaglidingLocationService.getAllActiveForMarkersWithForecast(),
          WeatherStationService.getNordicCountriesForMarkers()
        ]);

        paraglidingLocations = fetchedParaglidingLocations;
        weatherStations = fetchedWeatherStations;

        dataCache.setParaglidingLocations(paraglidingLocations);
        dataCache.setWeatherStations(weatherStations);
      }

      const { paraglidingMarkers, weatherStationMarkers } = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => {
          if ('station_id' in location) {
            const content = getWeatherStationInfoWindowContent(location);
            openInfoWindow(marker, content);
          } else {
            const infoWindowContent = document.createElement('div');
            const root = createRoot(infoWindowContent);
            root.render(getParaglidingInfoWindow(location));
            openInfoWindow(marker, infoWindowContent);
          }
        }
      });

      setParaglidingMarkers(paraglidingMarkers);
      setWeatherStationMarkers(weatherStationMarkers);
    } catch (err) {
      console.error('Error loading all markers:', err);
    }
  }, [openInfoWindow]);

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
          center: initialMapState?.center ?? MAP_CONFIG.DEFAULT_CENTER,
          zoom: initialMapState?.zoom ?? MAP_CONFIG.DEFAULT_ZOOM,
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

        map.addListener('click', () => {
          closeInfoWindow();
          setWindFilterExpanded(false);
        });

        setMapInstance(map);
        setIsLoading(false);

      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();

  }, [closeInfoWindow]);

  useEffect(() => {
    if (!mapInstance) {
      return;
    }

    const saveState = () => {
      const center = mapInstance.getCenter();
      const zoom = mapInstance.getZoom();

      const mapState = {
        center: center ? { lat: center.lat(), lng: center.lng() } : MAP_CONFIG.DEFAULT_CENTER,
        zoom: zoom || MAP_CONFIG.DEFAULT_ZOOM,
        showParaglidingMarkers,
        showWeatherStationMarkers,
        selectedWindDirections,
        windFilterAndOperator,
      };
      localStorage.setItem(MAP_STATE_KEY, JSON.stringify(mapState));
    };

    // Add listeners for map events
    const zoomListener = mapInstance.addListener('zoom_changed', saveState);
    const dragListener = mapInstance.addListener('dragend', saveState);

    // Save state whenever filters change
    saveState();

    return () => {
      google.maps.event.removeListener(zoomListener);
      google.maps.event.removeListener(dragListener);
    };
  }, [mapInstance, showParaglidingMarkers, showWeatherStationMarkers, selectedWindDirections, windFilterAndOperator]);

  useEffect(() => {
    if (mapInstance) {
      loadAllMarkers();
    }
  }, [mapInstance, loadAllMarkers]);

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
            markers={showParaglidingMarkers ? filterParaglidingMarkersByWindDirection(filterParaglidingMarkersByPromising(paraglidingMarkers), selectedWindDirections) : []}
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
            <MyLocation map={mapInstance} onLocationUpdate={handleLocationUpdate} onCloseInfoWindow={closeInfoWindow} />
            <FilterControl
              showParagliding={showParaglidingMarkers}
              showWeatherStations={showWeatherStationMarkers}
              onParaglidingFilterChange={setShowParaglidingMarkers}
              onWeatherStationFilterChange={setShowWeatherStationMarkers}
            />
            <WindFilterCompass
              onWindDirectionChange={handleWindDirectionChange}
              selectedDirections={selectedWindDirections}
              isExpanded={windFilterExpanded}
              setIsExpanded={setWindFilterExpanded}
              windFilterAndOperator={windFilterAndOperator}
              onFilterLogicChange={handleWindFilterLogicChange}
            />
            <PromisingFilter
              isExpanded={isPromisingFilterExpanded}
              setIsExpanded={setIsPromisingFilterExpanded}
              onFilterChange={setPromisingFilter}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleMaps;
