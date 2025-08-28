import React from 'react';

// Marker components using PNG images
export const ParaglidingMarker: React.FC = () => {
  return (
    <img
      src="/paraglider.png"
      alt="Paragliding location"
      className="w-8 h-8 cursor-pointer transition-transform duration-200 ease-in-out"
      draggable={false}
    />
  );
};

export const WeatherStationMarker: React.FC = () => {
  return (
    <img
      src="/windsockBlue.png"
      alt="Weather station"
      className="w-8 h-8 cursor-pointer transition-transform duration-200 ease-in-out"
      draggable={false}
    />
  );
};

// Utility function to create marker elements with PNG images
export const createParaglidingMarkerElement = (): HTMLElement => {
  const img = document.createElement('img');
  img.src = '/paraglider.png';
  img.alt = 'Paragliding location';
  img.className = 'w-8 h-8 cursor-pointer transition-transform duration-200 ease-in-out';
  img.draggable = false;
  return img;
};

export const createWeatherStationMarkerElement = (): HTMLElement => {
  const img = document.createElement('img');
  img.src = '/windsockBlue.png';
  img.alt = 'Weather station';
  img.className = 'w-8 h-8 cursor-pointer transition-transform duration-200 ease-in-out';
  img.draggable = false;
  return img;
};
