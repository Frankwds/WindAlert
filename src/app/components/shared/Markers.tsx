import { ParaglidingLocationWithForecast, WeatherStationWithData, StationData } from '@/lib/supabase/types';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';

const createDirectionCircle = (directionSymbols: string[]): SVGElement => {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.setAttribute("viewBox", "0 0 40 40");
  svg.style.userSelect = 'none';

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

export const createParaglidingMarkerElement = (): HTMLElement => {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '32px';
  container.style.height = '32px';
  container.style.userSelect = 'none';

  const img = document.createElement('img');
  img.src = '/paraglider.png';
  img.alt = 'Paragliding location';
  img.className = 'w-6 h-6'; // 24px
  img.style.position = 'absolute';
  img.style.top = '4px'; // Center 24px image in 32px container
  img.style.left = '4px';
  img.style.zIndex = '1';
  img.draggable = false;
  img.style.cursor = 'pointer';
  img.style.userSelect = 'none';

  container.appendChild(img);

  return container;
}

export const createParaglidingMarkerElementWithDirection = (location: ParaglidingLocationWithForecast): HTMLElement => {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '32px';
  container.style.height = '32px';
  container.style.userSelect = 'none';

  const img = document.createElement('img');
  img.src = '/paraglider.png';
  img.alt = 'Paragliding location';
  img.className = 'w-6 h-6'; // 24px
  img.style.position = 'absolute';
  img.style.top = '4px'; // Center 24px image in 32px container
  img.style.left = '4px';
  img.style.zIndex = '1';
  img.draggable = false;
  img.style.cursor = 'pointer';
  img.style.userSelect = 'none';

  const svg = createDirectionCircle(locationToWindDirectionSymbols(location));
  svg.style.position = 'absolute';
  svg.style.top = '-4px'; // Center 40px svg around 32px container
  svg.style.left = '-4px';
  svg.style.zIndex = '0';

  container.appendChild(svg);
  container.appendChild(img);

  return container;
}


// Function to determine wind arrow color based on speed
const getWindArrowColor = (speed: number): string => {
  const roundedSpeed = Math.round(speed);
  if (roundedSpeed === 0) return 'var(--wind-none)';
  if (roundedSpeed < 4) return 'var(--wind-calm)';
  if (roundedSpeed < 6) return 'var(--wind-light)';
  if (roundedSpeed <= 9) return 'var(--wind-moderate)';
  return 'var(--wind-strong)';
};

const createHollowWindTriangleSVG = (isClustered: boolean, direction: number, color: string = '#d8d8d8') => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '42');
  svg.setAttribute('height', '42');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.style.transform = `rotate(${direction + 180}deg)${isClustered ? 'scale(0.8)' : ``}`;
  svg.style.transformOrigin = 'center';
  svg.style.transition = 'transform 0.2s ease-in-out';

  // Clean wind arrow based on the provided SVG
  // Scaled and centered for 24x24 viewBox
  const windArrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  windArrow.setAttribute('d', 'M12 2 L4 20 L11 16 L13 16 L20 20 L12 2 Z');
  windArrow.setAttribute('fill', color);
  windArrow.setAttribute('stroke', 'black');
  windArrow.setAttribute('stroke-width', isClustered ? '0.8' : '0.5');
  windArrow.setAttribute('stroke-linecap', 'round');
  svg.appendChild(windArrow);

  return svg;
};

export const createWeatherStationClusterElement = (meanWindSpeed: number, meanWindDirection: number): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center cursor-pointer transition-transform duration-200 ease-in-out select-none';
  container.style.cursor = 'pointer';
  container.style.userSelect = 'none';

  // Create wind arrow SVG for cluster (no text, just the arrow)
  const windColor = getWindArrowColor(meanWindSpeed);
  const svg = createHollowWindTriangleSVG(true, meanWindDirection, windColor);
  container.appendChild(svg);

  return container;
};

export const createWeatherStationWindMarkerElement = (stationData: StationData[]): HTMLElement => {

  const container = document.createElement('div');
  container.className = 'flex flex-col items-center cursor-pointer transition-transform duration-200 ease-in-out select-none';
  container.style.cursor = 'pointer';
  container.style.userSelect = 'none';

  if (stationData.length === 0) {
    const svg = createHollowWindTriangleSVG(true, 0, getWindArrowColor(0));
    container.appendChild(svg);
    return container;
  }

  const latestData = stationData
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  const windColor = getWindArrowColor(latestData.wind_speed);
  const svg = createHollowWindTriangleSVG(false, latestData.direction, windColor);
  const textOverlay = createTextOverlay(latestData.wind_speed);

  container.appendChild(svg);
  container.appendChild(textOverlay);

  return container;
};

// Create non-rotating text overlay
const createTextOverlay = (windSpeed: number): HTMLElement => {
  const textOverlay = document.createElement('div');
  textOverlay.style.position = 'absolute';
  textOverlay.style.top = '50%';
  textOverlay.style.left = '50%';
  textOverlay.style.transform = 'translate(-50%, -50%)';
  textOverlay.style.pointerEvents = 'none';
  textOverlay.style.textAlign = 'center';
  textOverlay.style.fontSize = '12px';
  textOverlay.style.fontWeight = 'bold';
  textOverlay.style.color = 'black';
  textOverlay.style.textShadow = '0px 0px 1px rgba(255,255,255,1),0px 0px 3px rgba(255,255,255,1)';
  textOverlay.style.lineHeight = '1';
  textOverlay.style.zIndex = '10';
  textOverlay.textContent = `${Math.round(windSpeed)}`;

  return textOverlay;
};

export const createLandingMarkerElement = (): HTMLElement => {
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = '24px';
  container.style.height = '32px';
  container.style.userSelect = 'none';
  container.style.cursor = 'pointer';
  container.style.transform = 'translate(0%, 25%)';


  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '32');
  svg.setAttribute('viewBox', '-8 -8 440 528');

  // Create the group element
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  // Main pin body (dark green with white border)
  const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  mainPath.setAttribute('style', 'fill:darkgreen;stroke:white;stroke-width:8;');
  mainPath.setAttribute('d', 'M424.269,212.061c0,58.586-23.759,111.638-62.128,150.007L213.684,510.451L212.134,512   L62.275,362.141c-7.231-7.157-13.872-14.905-19.996-23.095C15.716,303.703,0,259.726,0,212.061   c0-51.06,18.077-97.914,48.182-134.512c8.78-10.773,18.668-20.586,29.366-29.367C114.147,18.077,161.074,0,212.134,0   c40.655,0,78.582,11.437,110.826,31.211c28.555,17.487,52.609,41.541,70.097,70.097   C412.831,133.552,424.269,171.478,424.269,212.061z');

  // Center circle (brown)
  const centerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  centerPath.setAttribute('style', 'fill:white;');
  centerPath.setAttribute('d', 'M339.392,212.081c0,70.284-56.968,127.258-127.259,127.258   c-70.277,0-127.258-56.974-127.258-127.258S141.856,84.822,212.133,84.822C282.424,84.822,339.392,141.797,339.392,212.081z');

  // Shadow/overlay (dark brown with opacity)
  const shadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shadowPath.setAttribute('style', 'opacity:0.13;fill:#604C3F;');
  shadowPath.setAttribute('d', 'M424.269,212.061c0,58.586-23.759,111.638-62.128,150.007L213.684,510.451L212.134,512   V0c40.655,0,78.582,11.437,110.826,31.211c28.555,17.487,52.609,41.541,70.097,70.097   C412.831,133.552,424.269,171.478,424.269,212.061z');

  // Add 'L' text in the center
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', '212');
  text.setAttribute('y', '270');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('fill', 'black');
  text.setAttribute('font-size', '200');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('font-family', 'Arial, sans-serif');
  text.textContent = 'L';

  group.appendChild(mainPath);
  group.appendChild(centerPath);
  group.appendChild(shadowPath);
  group.appendChild(text);
  svg.appendChild(group);
  container.appendChild(svg);

  // Add hover effects
  container.addEventListener('mouseenter', () => {
    container.style.transform = 'scale(1.1)';
  });

  container.addEventListener('mouseleave', () => {
    container.style.transform = 'scale(1)';
  });

  return container;
};