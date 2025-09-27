'use client';

import React from 'react';
import Image from 'next/image';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { createWeatherStationClusterElement } from '../../shared/Markers';

// Wind arrow icon component for filter control
const WindArrowIcon = () => {
  const [iconElement, setIconElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const element = createWeatherStationClusterElement(2, 270);
    // Make it smaller for filter control
    element.style.transform = 'scale(0.8)';
    setIconElement(element);
  }, []);

  if (!iconElement) return null;

  return <div dangerouslySetInnerHTML={{ __html: iconElement.outerHTML }} />;
};

interface FilterControlProps {
  showParagliding: boolean;
  showWeatherStations: boolean;
  showSkyways?: boolean;
  showThermals?: boolean;
  onParaglidingFilterChange: (isVisible: boolean) => void;
  onWeatherStationFilterChange: (isVisible: boolean) => void;
  onSkywaysFilterChange?: (isVisible: boolean) => void;
  onThermalsFilterChange?: (isVisible: boolean) => void;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  closeOverlays: (options?: { keep?: string }) => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({
  showParagliding,
  showWeatherStations,
  showSkyways = false,
  showThermals = false,
  onParaglidingFilterChange,
  onWeatherStationFilterChange,
  onSkywaysFilterChange,
  onThermalsFilterChange,
  isOpen,
  onToggle,
  closeOverlays: onCloseOverlays,
}) => {
  const isMobile = useIsMobile();

  const handleParaglidingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onParaglidingFilterChange(e.target.checked);
  };

  const handleWeatherStationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeatherStationFilterChange(e.target.checked);
  };

  const handleSkywaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSkywaysFilterChange) {
      onSkywaysFilterChange(e.target.checked);
    }
  };

  const handleThermalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onThermalsFilterChange) {
      onThermalsFilterChange(e.target.checked);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      onCloseOverlays({ keep: 'filtercontrol' });
    }
    onToggle(!isOpen);
  };

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-[var(--shadow-md)]">
        {/* Toggle Button */}
        <button
          onClick={toggleDropdown}
          className={`flex items-center gap-4 p-2 ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} rounded-lg cursor-pointer min-w-[72px] select-none`}
          aria-label="Toggle filters"
        >
          {/* Filters Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--foreground)]"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
          </svg>

          {/* Arrow Icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--muted)] ${isOpen ? 'rotate-180' : ''
              }`}
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="border-t border-[var(--border)] p-1">
            <div className="flex flex-col gap-1">
              <label htmlFor="paragliding" className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}>
                <input
                  type="checkbox"
                  id="paragliding"
                  checked={showParagliding}
                  onChange={handleParaglidingChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <Image src="/paraglider.png" alt="Paragliding" width={24} height={24} className="w-6 h-6" />
              </label>

              <label htmlFor="weatherStation" className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}>
                <input
                  type="checkbox"
                  id="weatherStation"
                  checked={showWeatherStations}
                  onChange={handleWeatherStationChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <div className="w-6 h-6 flex items-center justify-center ">
                  <WindArrowIcon />
                </div>
              </label>

              <label htmlFor="skyways" className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}>
                <input
                  type="checkbox"
                  id="skyways"
                  checked={showSkyways}
                  onChange={handleSkywaysChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <Image src="/thermalkk7.webp" alt="Skyways" width={24} height={24} className="w-6 h-6" />
              </label>

              <label htmlFor="thermals" className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}>
                <input
                  type="checkbox"
                  id="thermals"
                  checked={showThermals}
                  onChange={handleThermalsChange}
                  className="mr-2 h-4 w-4 cursor-pointer"
                />
                <Image src="/cumulonimbus.png" alt="Thermals" width={24} height={24} className="px-0.5 w-6 h-6" />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
