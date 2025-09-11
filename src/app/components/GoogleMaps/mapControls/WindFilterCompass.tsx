'use client';

import React from 'react';
import { useIsMobile } from '@/lib/hooks/useIsMobile';

interface WindFilterCompassProps {
  onWindDirectionChange: (directions: string[]) => void;
  selectedDirections: string[];
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  windFilterAndOperator: boolean;
  onFilterLogicChange: () => void;
  closeOverlays: (options?: { keep?: string }) => void;
}

const WindFilterCompass: React.FC<WindFilterCompassProps> = ({
  onWindDirectionChange,
  selectedDirections,
  isExpanded,
  setIsExpanded,
  windFilterAndOperator,
  onFilterLogicChange,
  closeOverlays: onCloseOverlays
}) => {
  const isMobile = useIsMobile();
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
  const handleDirectionClick = (dir: string) => {
    if (!isExpanded) return;
    const newSelected = selectedDirections.includes(dir)
      ? selectedDirections.filter(d => d !== dir)
      : [...selectedDirections, dir];
    onWindDirectionChange(newSelected);
  };

  return (
    <div
      className="absolute top-3 right-16 z-10 cursor-pointer"
      // onMouseEnter={() => setIsExpanded(true)}
      // onMouseLeave={() => setIsExpanded(false)}
      onClick={() => {
        if (!isExpanded) {
          onCloseOverlays({ keep: 'windfilter' });
          setIsExpanded(true);
        }
      }}
    >
      <svg viewBox={isExpanded ? "0 0 130 130" : "0 0 44 44"} className={`transition-all duration-300 ${isExpanded ? 'w-48 h-48' : 'w-11 h-11'}`}>
        {directions.map((dir, i) => {
          const isSelected = selectedDirections.includes(dir);
          return (
            <g key={dir} onClick={() => handleDirectionClick(dir)}>
              <path
                d={getPath(i)}
                className={`fill-[var(--border)] stroke-[var(--background)] stroke-[1px] transition-colors duration-200 ${isSelected ? "fill-[var(--success)]" : ""}`}
              />
            </g>
          );
        })}
      </svg>

      {/* Toggle box for AND/OR logic - only visible when expanded */}
      {isExpanded && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-md)]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFilterLogicChange();
              }}
              className={`w-6 h-6 bg-transparent ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} border-none rounded-md cursor-pointer text-[var(--foreground)] duration-200 ease-in-out flex items-center justify-center font-mono text-sm font-bold`}
              title={`Filter logic: ${windFilterAndOperator ? 'AND (&)' : 'OR (||)'}`}
            >
              {windFilterAndOperator ? '&' : '||'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WindFilterCompass;
