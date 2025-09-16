import React from 'react';
import { renderToString } from 'react-dom/server';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import LocationCardMain, { LocationCardAll } from '../LocationCards';

interface ParaglidingInfoWindowProps {
  location: ParaglidingMarkerData;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationMarkerData;
}

interface AllStartsInfoWindowProps {
  location: ParaglidingMarkerData;
}

export const ParaglidingInfoWindow: React.FC<ParaglidingInfoWindowProps> = ({ location }) => {
  return (
    <LocationCardMain
      location={location}
      timezone="Europe/Oslo"
    />
  );
};

export const WeatherStationInfoWindow: React.FC<WeatherStationInfoWindowProps> = ({ location }) => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">🌤️{location.name} ({location.altitude}m)</h3>
      <div className='flex flex-row justify-center'>
        <div className=''>
          <iframe
            src={`https://widget.holfuy.com/?station=${location.station_id}&su=m/s&t=C&lang=en&mode=rose&size=160`}
            style={{ width: '160px', height: '160px', color: 'var(--foreground)' }}
          ></iframe>
        </div>

      </div>
    </div>
  );
};

export const AllStartsInfoWindow: React.FC<AllStartsInfoWindowProps> = ({ location }) => {
  return (
    <LocationCardAll
      location={location}
    />
  );
};
// Utility function to render any React component to HTML string
export const renderComponentToString = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  props: T
): string => {
  return renderToString(React.createElement(Component, props));
};

export const getWeatherStationInfoWindowContent = (location: WeatherStationMarkerData): string => {
  return renderComponentToString(WeatherStationInfoWindow, { location });
};

export const getParaglidingInfoWindowMain = (location: ParaglidingMarkerData) => {
  return <ParaglidingInfoWindow location={location} />;
};

export const getParaglidingInfoWindowAll = (location: ParaglidingMarkerData) => {
  return <AllStartsInfoWindow location={location} />;
};