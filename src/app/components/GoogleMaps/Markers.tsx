import React from 'react';
import Image from 'next/image';
import { ParaglidingMarkerData } from '@/lib/supabase/types';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';

// Marker components using PNG images
export const ParaglidingMarker: React.FC = () => {
  return (
    <Image
      src="/paraglider.png"
      alt="Paragliding location"
      width={24}
      height={24}
      className="w-6 h-6 cursor-pointer transition-transform duration-200 ease-in-out"
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

const createDirectionCircle = (directionSymbols: string[]): SVGElement => {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.setAttribute("viewBox", "0 0 40 40");

  const directions = [
    { name: 'n', angle: -90 },
    { name: 'ne', angle: -45 },
    { name: 'e', angle: 0 },
    { name: 'se', angle: 45 },
    { name: 's', angle: 90 },
    { name: 'sw', angle: 135 },
    { name: 'w', angle: 180 },
    { name: 'nw', angle: -135 },
  ];

  const radius = 16;
  const strokeWidth = 5;
  const center = 20;

  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = {
      x: center + radius * Math.cos(startAngle * Math.PI / 180),
      y: center + radius * Math.sin(startAngle * Math.PI / 180),
    };
    const end = {
      x: center + radius * Math.cos(endAngle * Math.PI / 180),
      y: center + radius * Math.sin(endAngle * Math.PI / 180),
    };
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
  };

  directions.forEach(({ name, angle }) => {
    const isVisible = directionSymbols.includes(name);
    if (isVisible) {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", getArcPath(angle - 20, angle + 20));
      path.setAttribute("stroke", "rgb(0, 128, 0)");
      path.setAttribute("stroke-width", strokeWidth.toString());
      path.setAttribute("fill", "none");
      svg.appendChild(path);
    }
  });

  return svg;
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

export const createParaglidingMarkerElementWithDirection = (location: ParaglidingMarkerData): HTMLElement => {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '32px';
  container.style.height = '32px';

  const img = document.createElement('img');
  img.src = '/paraglider.png';
  img.alt = 'Paragliding location';
  img.className = 'w-6 h-6'; // 24px
  img.style.position = 'absolute';
  img.style.top = '4px'; // Center 24px image in 32px container
  img.style.left = '4px';
  img.style.zIndex = '1';
  img.draggable = false;

  const svg = createDirectionCircle(locationToWindDirectionSymbols(location));
  svg.style.position = 'absolute';
  svg.style.top = '-4px'; // Center 40px svg around 32px container
  svg.style.left = '-4px';
  svg.style.zIndex = '0';

  container.appendChild(svg);
  container.appendChild(img);

  return container;
}

export const createWeatherStationMarkerElement = (): HTMLElement => {
  const img = document.createElement('img');
  img.src = '/windsockBlue.png';
  img.alt = 'Weather station';
  img.className = 'w-8 h-8 cursor-pointer transition-transform duration-200 ease-in-out';
  img.draggable = false;
  return img;
};
