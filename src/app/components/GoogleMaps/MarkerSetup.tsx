import { WeatherStationWithLatestData, ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import {
  createParaglidingMarkerElementWithDirection,
  createWeatherStationWindMarkerElement,
  refreshWeatherStationWindMarkerContent,
  createLandingMarkerElement,
} from '../shared/Markers';

type onParaglidingMarkerClickHandler = (
  marker: google.maps.marker.AdvancedMarkerElement,
  location: ParaglidingLocationWithForecast
) => void;
type onWeatherStationMarkerClickHandler = (
  marker: google.maps.marker.AdvancedMarkerElement,
  location: WeatherStationWithLatestData
) => void;

export const createParaglidingMarkers = (
  paraglidingLocations: ParaglidingLocationWithForecast[],
  onMarkerClick: onParaglidingMarkerClickHandler
) => {
  return paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location, onMarkerClick);
    return marker;
  });
};

export const createParaglidingMarker = (
  location: ParaglidingLocationWithForecast,
  onMarkerClick: onParaglidingMarkerClickHandler
) => {
  const markerElement = createParaglidingMarkerElementWithDirection(location);

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude, lng: location.longitude },
    title: location.name,
    content: markerElement,
  });

  // Store the location data with the marker for filtering purposes
  (marker as any).locationData = location;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1) translate(0%, 45%)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1) translate(0%, 50%)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    event.stopPropagation();
    onMarkerClick(marker, location);
  });

  marker.zIndex = 1000;

  return marker;
};

export const createWeatherStationMarker = (
  location: WeatherStationWithLatestData,
  onMarkerClick: onWeatherStationMarkerClickHandler
) => {
  const markerElement = createWeatherStationWindMarkerElement([location.station_data]);

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement,
  });

  // Store the current station data on the marker so clicks and in-place updates
  // always read the latest data (parity with paragliding markers).
  (marker as any).locationData = location;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1) translate(0%, 45%)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1) translate(0%, 50%)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    // Prevent the click event from bubbling up to the map
    event.stopPropagation();
    onMarkerClick(marker, (marker as any).locationData as WeatherStationWithLatestData);
  });
  marker.zIndex = 2000;

  return marker;
};

// Update an existing weather-station marker in place: refresh its wind visuals
// and stored data without recreating the AdvancedMarkerElement, so any
// marker-anchored info window stays attached and listeners are preserved.
export const updateWeatherStationMarker = (
  marker: google.maps.marker.AdvancedMarkerElement,
  location: WeatherStationWithLatestData
) => {
  const container = marker.content as HTMLElement | null;
  if (container) {
    refreshWeatherStationWindMarkerContent(container, [location.station_data]);
  }
  (marker as any).locationData = location;
  marker.title = location.name;
};

export const createLandingMarker = (
  location: ParaglidingLocationWithForecast
): google.maps.marker.AdvancedMarkerElement => {
  const markerElement = createLandingMarkerElement();

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.landing_latitude!, lng: location.landing_longitude! },
    title: `${location.name} landing`,
    content: markerElement,
  });

  // Set high z-index to ensure landing marker appears above other markers
  marker.zIndex = 500;

  // Store the location data with the marker
  (marker as any).locationData = location;

  markerElement.addEventListener('click', (event: Event) => {
    event.stopPropagation();
  });

  return marker;
};
