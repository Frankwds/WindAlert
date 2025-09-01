import React from 'react';
import { renderToString } from 'react-dom/server';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import MinimalHourlyWeather from './MinimalHourlyWeather';
import TinyWindCompass from './TinyWindCompass';

interface ParaglidingInfoWindowProps {
  location: ParaglidingMarkerData;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationMarkerData;
}

export const ParaglidingInfoWindow: React.FC<ParaglidingInfoWindowProps> = ({ location }) => {

  const allowedDirections = Object.entries(location)
    .filter(([key, value]) => value === true && ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].includes(key))
    .map(([key]) => key);

  return (
    <div className="min-w-96 max-w-full flex flex-col">
      <div className="flex items-center mb-2 flex-shrink-0">
        <TinyWindCompass allowedDirections={allowedDirections} />
        <h3 className="font-bold text-lg flex-1 text-center hover:underline mt-2">
          <a href={`/locations/${location.id}`} rel="noopener noreferrer">
            {location.name} ({location.altitude}m)
          </a>
        </h3>
      </div>
      <div className="flex-1 overflow-hidden">
        {location.forecast_cache && (
          <MinimalHourlyWeather
            weatherData={location.forecast_cache}
            timezone={'Europe/Oslo'}
          />
        )}
      </div>
    </div>
  );
};

export const WeatherStationInfoWindow: React.FC<WeatherStationInfoWindowProps> = ({ location }) => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">🌤️{location.name} ({location.altitude}m)</h3>
      <div className='flex flex-row relative'>
        <div className='overflow-hidden z-100 bg-white'>
          <iframe
            src={`https://widget.holfuy.com/?station=${location.station_id}&su=m/s&t=C&lang=en&mode=rose&size=160`}
            style={{ width: '160px', height: '160px' }}
          ></iframe>
        </div>
        <div className='z-50 ml-[-85px]' >
          <iframe
            src={`https://widget.holfuy.com/?station=${location.station_id}&su=m/s&t=C&lang=en&mode=average_hourly`}
            style={{ width: '320x', height: '160px' }}
          ></iframe>
        </div>
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

export const getWeatherStationInfoWindowContent = (location: WeatherStationMarkerData): string => {
  return renderComponentToString(WeatherStationInfoWindow, { location });
};

export const getParaglidingInfoWindow = (location: ParaglidingMarkerData) => {
  return <ParaglidingInfoWindow location={location} />;
};
