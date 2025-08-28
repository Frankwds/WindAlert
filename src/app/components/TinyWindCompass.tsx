import React from "react";

interface WindCompassProps {
  allowedDirections: string[];
}

const TinyWindCompass: React.FC<WindCompassProps> = ({ allowedDirections }) => {
  const directions = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
  const numSegments = directions.length;
  const angleStep = 360 / numSegments;
  const radius = 20;
  const center = 22;

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
      x: center + (radius - 8) * Math.cos((angle * Math.PI) / 180),
      y: center + (radius - 8) * Math.sin((angle * Math.PI) / 180),
    };
  };

  return (
    <svg viewBox="0 0 44 44" className="w-11 h-11">
      {directions.map((dir, i) => {
        const isAllowed = allowedDirections.includes(dir);
        const textPos = getTextPosition(i);
        return (
          <g key={dir}>
            <path
              d={getPath(i)}
              className={`fill-[var(--border)] stroke-[var(--background)] stroke-[1px] transition-colors duration-200 ${isAllowed ? "fill-[var(--success)]" : ""}`}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default TinyWindCompass;
