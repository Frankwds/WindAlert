import React from 'react';
import { renderToString } from 'react-dom/server';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

interface ParaglidingInfoWindowProps {
  location: ParaglidingMarkerData;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationMarkerData;
}

export const ParaglidingInfoWindow: React.FC<ParaglidingInfoWindowProps> = ({ location }) => {
  return (
    <div className="p-3">
      <h3 className="font-bold text-lg mb-2">{location.name}</h3>
      <p className="text-sm text-gray-600 mb-2">🪂 Paragliding Spot</p>
      <div className="mt-3 text-xs text-gray-500">
        <p>Lat: {location.latitude.toFixed(4)}°</p>
        <p>Lng: {location.longitude.toFixed(4)}°</p>
        <p>Altitude: {location.altitude}m</p>
      </div>
    </div>
  );
};

export const WeatherStationInfoWindow: React.FC<WeatherStationInfoWindowProps> = ({ location }) => {
  return (
    <div className="p-3">
      <h3 className="font-bold text-lg mb-2">{location.name}</h3>
      <iframe
        frameBorder="0"
        marginHeight={1}
        marginWidth={1}
        scrolling="no"
        src={`https://widget.holfuy.com/?station=${location.station_id}&su=m/s&t=C&lang=en&mode=rose&size=160`}
        style={{ width: '160px', height: '160px' }}
      ></iframe>
      <p className="text-sm text-gray-600 mb-2">🌤️ Weather Station</p>
      <div className="mt-3 text-xs text-gray-500">
        <p>Lat: {location.latitude?.toFixed(4)}°</p>
        <p>Lng: {location.longitude?.toFixed(4)}°</p>
        <p>Altitude: {location.altitude}m</p>
        <p>Station ID: {location.station_id}</p>
      </div>
    </div>
  );
};

// Utility function to render any React component to HTML string
export const renderComponentToString = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  props: T
): string => {
  return renderToString(React.createElement(Component, props));
};

// Helper functions to convert React components to HTML strings for Google Maps
export const getParaglidingInfoWindowContent = (location: ParaglidingMarkerData): string => {
  return renderComponentToString(ParaglidingInfoWindow, { location });
};

export const getWeatherStationInfoWindowContent = (location: WeatherStationMarkerData): string => {
  return renderComponentToString(WeatherStationInfoWindow, { location });
};

