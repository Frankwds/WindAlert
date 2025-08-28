import React from 'react';
import { renderToString } from 'react-dom/server';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import MinimalHourlyWeather from '../MinimalHourlyWeather';

interface ParaglidingInfoWindowProps {
  location: ParaglidingMarkerData;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationMarkerData;
}

export const ParaglidingInfoWindow: React.FC<ParaglidingInfoWindowProps> = ({ location }) => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">{location.name} ({location.altitude}m)</h3>
      {location.weatherData && (
        <MinimalHourlyWeather
          weatherData={location.weatherData}
          timezone={'Europe/Oslo'}
        />
      )}
    </div>
  );
};

export const WeatherStationInfoWindow: React.FC<WeatherStationInfoWindowProps> = ({ location }) => {
  return (
    <div>
      <h3 className="font-bold text-lg mb-2">🌤️{location.name} ({location.altitude}m)</h3>
      <div className='flex flex-row justify-between relative'>
        <div className='overflow-y-hidden z-10 bg-white'>
          <iframe
            src={`https://widget.holfuy.com/?station=${location.station_id}&su=m/s&t=C&lang=en&mode=rose&size=160`}
            style={{ width: '160px', height: '160px' }}
          ></iframe>
        </div>
        <div className='overflow-y-hidden relative z-5' >
          <iframe
            src={`https://widget.holfuy.com/?station=${location.station_id}&su=m/s&t=C&lang=en&mode=average_hourly&avgrows=32`}
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
