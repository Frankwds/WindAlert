import { WeatherStationWithData, ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { createParaglidingMarkerElementWithDirection, createWeatherStationWindMarkerElement, createLandingMarkerElement } from '../shared/Markers';

type onParaglidingMarkerClickHandler = (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
type onWeatherStationMarkerClickHandler = (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationWithData) => void;

export const createParaglidingMarkers = (paraglidingLocations: ParaglidingLocationWithForecast[], onMarkerClick: onParaglidingMarkerClickHandler) => {
  return paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location, onMarkerClick);
    return marker;
  });
};

export const createWeatherStationMarkers = (weatherStations: WeatherStationWithData[], onMarkerClick: onWeatherStationMarkerClickHandler) => {
  return weatherStations.map(location => {
    const marker = createWeatherStationMarker(location, onMarkerClick);
    return marker;
  });
};

export const createParaglidingMarker = (location: ParaglidingLocationWithForecast, onMarkerClick: onParaglidingMarkerClickHandler) => {
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

  marker.zIndex = 1000;

  return marker;
};

export const createWeatherStationMarker = (location: WeatherStationWithData, onMarkerClick: onWeatherStationMarkerClickHandler) => {
  const markerElement = createWeatherStationWindMarkerElement(location.station_data);

  // Store wind data in the marker element for cluster access
  const latestData = location.station_data
    .filter(data => data.wind_speed !== null && data.direction !== null)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  if (latestData) {
    markerElement.dataset.windSpeed = latestData.wind_speed.toString();
    markerElement.dataset.windDirection = latestData.direction.toString();
  }

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement,
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
  marker.zIndex = 2000;

  return marker;
};


export const createLandingMarker = (location: ParaglidingLocationWithForecast): google.maps.marker.AdvancedMarkerElement => {
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
