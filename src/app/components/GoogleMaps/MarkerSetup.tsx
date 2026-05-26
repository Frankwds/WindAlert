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

type WeatherStationMarkerWithData = google.maps.marker.AdvancedMarkerElement & {
  locationData?: WeatherStationWithLatestData;
};

export const createParaglidingMarkers = (
  paraglidingLocations: ParaglidingLocationWithForecast[],
  onMarkerClick: onParaglidingMarkerClickHandler
) => {
  return paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location, onMarkerClick);
    return marker;
  });
};

export const createWeatherStationMarkers = (
  weatherStations: WeatherStationWithLatestData[],
  onMarkerClick: onWeatherStationMarkerClickHandler
) => {
  return weatherStations.map(location => {
    const marker = createWeatherStationMarker(location, onMarkerClick);
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
  }) as WeatherStationMarkerWithData;
  marker.locationData = location;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1) translate(0%, 45%)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1) translate(0%, 50%)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    // Prevent the click event from bubbling up to the map
    event.stopPropagation();
    if (!marker.locationData) return;
    onMarkerClick(marker, marker.locationData);
  });
  marker.zIndex = 2000;

  return marker;
};

export const updateWeatherStationMarker = (
  marker: google.maps.marker.AdvancedMarkerElement,
  location: WeatherStationWithLatestData
) => {
  const markerWithData = marker as WeatherStationMarkerWithData;
  markerWithData.locationData = location;
  marker.title = location.name;

  const markerContent = marker.content;
  const contentElement =
    markerContent instanceof HTMLElement
      ? markerContent
      : markerContent instanceof Element
        ? (markerContent as HTMLElement)
        : null;

  if (!contentElement) {
    return;
  }

  refreshWeatherStationWindMarkerContent(contentElement, [location.station_data]);
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
