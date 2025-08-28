import React from 'react';
import { renderToString } from 'react-dom/server';

// Marker components
export const ParaglidingMarker: React.FC = () => {
  return (
    <div className="w-8 h-8 rounded-full bg-red-400 border-2 border-white flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-md transition-transform duration-200 ease-in-out">
      P
    </div>
  );
};

export const WeatherStationMarker: React.FC = () => {
  return (
    <div className="w-8 h-8 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center text-white font-bold text-xs cursor-pointer shadow-md transition-transform duration-200 ease-in-out">
      W
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

// Helper functions to convert React marker components to HTML strings
export const getParaglidingMarkerHTML = (): string => {
  return renderComponentToString(ParaglidingMarker, {});
};

export const getWeatherStationMarkerHTML = (): string => {
  return renderComponentToString(WeatherStationMarker, {});
};
