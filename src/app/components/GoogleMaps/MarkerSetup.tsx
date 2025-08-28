import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';
import { paraglidingMarkerHTML } from './clusterer/sharedMarkerStyles';
import { weatherStationMarkerHTML } from './clusterer/sharedMarkerStyles';
import { createParaglidingInfoWindow } from './ParaglidingInfoWindow';
import { createWeatherStationInfoWindow } from './WeatherStationInfoWindow';


interface MarkerManagerProps {
  paraglidingLocations: ParaglidingLocation[];
  weatherStations: WeatherStation[];
  map: google.maps.Map;
}

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
  map
}: MarkerManagerProps) => {
  // Create paragliding markers with info windows
  const paraglidingMarkers = paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location, map);
    return marker;
  });

  // Create weather station markers with info windows
  const weatherStationMarkers = weatherStations.map(location => {
    const marker = createWeatherStationMarker(location, map);
    return marker;
  });

  return { paraglidingMarkers, weatherStationMarkers };
};

export const createParaglidingMarker = (location: ParaglidingLocation, map: google.maps.Map) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = paraglidingMarkerHTML;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude, lng: location.longitude },
    title: location.name,
    content: markerElement
  });

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  const infoWindow = createParaglidingInfoWindow({ location: location as ParaglidingLocation });
  markerElement.addEventListener('click', () => {
    infoWindow.open(map, marker);
  });

  return marker;
};

export const createWeatherStationMarker = (location: WeatherStation, map: google.maps.Map) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = weatherStationMarkerHTML;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement
  });

  // Attach location data to marker for efficient click handling
  (marker as any).weatherStationLocation = location;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  const infoWindow = createWeatherStationInfoWindow({ location: location as WeatherStation });
  markerElement.addEventListener('click', () => {
    infoWindow.open(map, marker);
  });

  return marker;
};




