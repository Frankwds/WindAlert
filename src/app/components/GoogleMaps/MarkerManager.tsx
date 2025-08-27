import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';
import { createParaglidingMarker } from './ParaglidingMarker';
import { createWeatherStationMarker } from './WeatherStationMarker';
import { createParaglidingInfoWindow } from './ParaglidingInfoWindow';
import { createWeatherStationInfoWindow } from './WeatherStationInfoWindow';

interface MarkerManagerProps {
  paraglidingLocations: ParaglidingLocation[];
  weatherStations: WeatherStation[];
  mapInstance: google.maps.Map;
}

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
  mapInstance,
}: MarkerManagerProps) => {
  const paraglidingMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  const weatherStationMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

  // Create paragliding markers with info windows
  paraglidingLocations.forEach(location => {
    const marker = createParaglidingMarker({ location });
    const infoWindow = createParaglidingInfoWindow({ location });

    // Add click event listener to the marker element
    const markerElement = marker.content as HTMLElement;
    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });
    paraglidingMarkers.push(marker);
  });

  // Create weather station markers with info windows
  weatherStations.forEach(location => {
    const marker = createWeatherStationMarker({ location });
    const infoWindow = createWeatherStationInfoWindow({ location });

    // Add click event listener to the marker element
    const markerElement = marker.content as HTMLElement;
    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });
    weatherStationMarkers.push(marker);
  });

  return { paraglidingMarkers, weatherStationMarkers };
};
