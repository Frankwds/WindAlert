import React from 'react';
import Image from 'next/image';

// Marker components using PNG images
export const ParaglidingMarker: React.FC = () => {
  return (
    <Image
      src="/paraglider.png"
      alt="Paragliding location"
      width={32}
      height={32}
      className="w-8 h-8 cursor-pointer transition-transform duration-200 ease-in-out"
      draggable={false}
    />
  );
};

export const WeatherStationMarker: React.FC = () => {
  return (
    <Image
      src="/windsockBlue.png"
      alt="Weather station"
      width={32}
      height={32}
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
