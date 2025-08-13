import React from 'react';

interface WindCompassProps {
  allowedDirections: string[];
}

const WindCompass: React.FC<WindCompassProps> = ({ allowedDirections }) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const numSegments = directions.length;
  const angleStep = 360 / numSegments;
  const radius = 100;
  const center = 105;

  const getPath = (index: number) => {
    const startAngle = -angleStep / 2 + index * angleStep - 90;
    const endAngle = angleStep / 2 + index * angleStep - 90;
    const start = {
      x: center + radius * Math.cos((startAngle * Math.PI) / 180),
      y: center + radius * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: center + radius * Math.cos((endAngle * Math.PI) / 180),
      y: center + radius * Math.sin((endAngle * Math.PI) / 180),
    };
    return `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 0,1 ${end.x},${end.y} Z`;
  };

  const getTextPosition = (index: number) => {
    const angle = index * angleStep - 90;
    return {
      x: center + (radius - 20) * Math.cos((angle * Math.PI) / 180),
      y: center + (radius - 20) * Math.sin((angle * Math.PI) / 180),
    };
  };

  return (
    <svg width="210" height="210" viewBox="0 0 210 210">
      {directions.map((dir, i) => {
        const isAllowed = allowedDirections.includes(dir);
        const textPos = getTextPosition(i);
        return (
          <g key={dir}>
            <path
              d={getPath(i)}
              className={`compass-wedge ${isAllowed ? 'allowed' : ''}`}
            />
            <text
              x={textPos.x}
              y={textPos.y}
              className="compass-text"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {dir}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default WindCompass;
