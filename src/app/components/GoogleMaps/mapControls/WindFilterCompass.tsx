'use client';

import React, { useState } from 'react';

interface WindFilterCompassProps {
  onWindDirectionChange: (directions: string[]) => void;
}

const WindFilterCompass: React.FC<WindFilterCompassProps> = ({ onWindDirectionChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);

  const directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  const numSegments = directions.length;
  const angleStep = 360 / numSegments;
  const radius = isExpanded ? 60 : 20;
  const center = isExpanded ? 65 : 22;

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
    const textRadius = isExpanded ? radius - 15 : radius - 8;
    return {
      x: center + textRadius * Math.cos((angle * Math.PI) / 180),
      y: center + textRadius * Math.sin((angle * Math.PI) / 180),
    };
  };

  const handleDirectionClick = (dir: string) => {
    if (!isExpanded) return;
    const newSelected = selectedDirections.includes(dir)
      ? selectedDirections.filter(d => d !== dir)
      : [...selectedDirections, dir];
    setSelectedDirections(newSelected);
    onWindDirectionChange(newSelected);
  };

  return (
    <div
      className="absolute top-3 right-20 z-10 cursor-pointer"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <svg viewBox={isExpanded ? "0 0 130 130" : "0 0 44 44"} className={`transition-all duration-300 ${isExpanded ? 'w-32 h-32' : 'w-11 h-11'}`}>
        {directions.map((dir, i) => {
          const isSelected = selectedDirections.includes(dir);
          const textPos = getTextPosition(i);
          return (
            <g key={dir} onClick={() => handleDirectionClick(dir)}>
              <path
                d={getPath(i)}
                className={`fill-[var(--border)] stroke-[var(--background)] stroke-[1px] transition-colors duration-200 ${isSelected ? "fill-[var(--success)]" : ""}`}
              />
              <text
                x={textPos.x}
                y={textPos.y}
                className={`${isExpanded ? 'text-sm' : 'text-[8px]'} font-sans fill-[var(--foreground)]`}
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {dir}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WindFilterCompass;
