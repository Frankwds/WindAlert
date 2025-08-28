import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';
import { paraglidingMarkerHTML, weatherStationMarkerHTML } from './clusterer/Markers';

type onMarkerClickHandler = (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocation | WeatherStation) => void;

interface MarkerManagerProps {
  paraglidingLocations: ParaglidingLocation[];
  weatherStations: WeatherStation[];
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
  const weatherStationMarkers = weatherStations.map(location => {
    const marker = createWeatherStationMarker(location, onMarkerClick);
    return marker;
  });

  return { paraglidingMarkers, weatherStationMarkers };
};

export const createParaglidingMarker = (location: ParaglidingLocation, onMarkerClick: onMarkerClickHandler) => {
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

  markerElement.addEventListener('click', (event: Event) => {
    event.stopPropagation();
    onMarkerClick(marker, location);
  });

  return marker;
};

export const createWeatherStationMarker = (location: WeatherStation, onMarkerClick: onMarkerClickHandler) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = weatherStationMarkerHTML;

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
