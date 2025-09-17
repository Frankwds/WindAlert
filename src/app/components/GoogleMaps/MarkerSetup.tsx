import { WeatherStationMarkerData, ParaglidingMarkerData } from '@/lib/supabase/types';
import { createParaglidingMarkerElementWithDirection, createWeatherStationMarkerElement } from './Markers';

type onMarkerClickHandler = (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => void;

interface MarkerManagerProps {
  paraglidingLocations: ParaglidingMarkerData[];
  weatherStations: WeatherStationMarkerData[];
  onMarkerClick: onMarkerClickHandler;
}

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
  onMarkerClick,
}: MarkerManagerProps) => {
  // Create paragliding markers with info windows
  const paraglidingMarkers = paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location, onMarkerClick);
    return marker;
  });

  // Create weather station markers with info windows
  // const weatherStationMarkers = weatherStations.map(location => {
  //   const marker = createWeatherStationMarker(location, onMarkerClick);
  //   return marker;
  // });
  console.log('weatherStations', weatherStations);
  const weatherStationMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

  return { paraglidingMarkers, weatherStationMarkers };
};

export const createParaglidingMarker = (location: ParaglidingMarkerData, onMarkerClick: onMarkerClickHandler) => {
  const markerElement = createParaglidingMarkerElementWithDirection(location);

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude, lng: location.longitude },
    title: location.name,
    content: markerElement
  });

  // Store the location data with the marker for filtering purposes
  (marker as any).locationData = location;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    event.stopPropagation();
    onMarkerClick(marker, location);
  });

  return marker;
};

export const createWeatherStationMarker = (location: WeatherStationMarkerData, onMarkerClick: onMarkerClickHandler) => {
  const markerElement = createWeatherStationMarkerElement();

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement
  });

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    // Prevent the click event from bubbling up to the map
    event.stopPropagation();
    onMarkerClick(marker, location);
  });

  return marker;
};
