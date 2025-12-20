'use client';

import React from 'react';
import Image from 'next/image';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { createWeatherStationClusterElement, createLandingMarkerElement } from '../../shared/Markers';

// Wind arrow icon component for filter control
const WindArrowIcon = () => {
  const [iconElement, setIconElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const element = createWeatherStationClusterElement(2, 270);
    // Make it smaller for filter control and reset positioning
    element.style.transform = 'scale(0.8)';
    setIconElement(element);
  }, []);

  if (!iconElement) return null;

  return <div dangerouslySetInnerHTML={{ __html: iconElement.outerHTML }} />;
};

// Landing icon component for filter control
const LandingIcon = () => {
  const [iconElement, setIconElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    const element = createLandingMarkerElement();
    // Reset inherited transform from createLandingMarkerElement
    element.style.transform = 'translate(0%, 0%)';
    setIconElement(element);
  }, []);

  if (!iconElement) return null;

  return <div dangerouslySetInnerHTML={{ __html: iconElement.outerHTML }} />;
};

interface FilterControlProps {
  showParagliding: boolean;
  showWeatherStations: boolean;
  showLandings: boolean;
  showSkyways?: boolean;
  showThermals?: boolean;
  onParaglidingFilterChange: (isVisible: boolean) => void;
  onWeatherStationFilterChange: (isVisible: boolean) => void;
  onLandingsFilterChange: (isVisible: boolean) => void;
  onSkywaysFilterChange?: (isVisible: boolean) => void;
  onThermalsFilterChange?: (isVisible: boolean) => void;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  closeOverlays: (options?: { keep?: string }) => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({
  showParagliding,
  showWeatherStations,
  showLandings,
  showSkyways = false,
  showThermals = false,
  onParaglidingFilterChange,
  onWeatherStationFilterChange,
  onLandingsFilterChange,
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

  const handleLandingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLandingsFilterChange(e.target.checked);
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
    <div className='absolute top-3 left-3 z-10'>
      <div className='bg-[var(--background)]/90 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-[var(--shadow-md)]'>
        {/* Toggle Button */}
        <button
          onClick={toggleDropdown}
          className={`flex items-center gap-4 p-2 ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} rounded-lg cursor-pointer min-w-[72px] select-none`}
          aria-label='Toggle visibility'
        >
          {/* Eye Icon */}
          <svg width='30' height='30' viewBox='0 0 100 100' fill='none' className='text-[var(--foreground)]'>
            <path
              d='M50 20C30 20 10 50 10 50C10 50 30 80 50 80C70 80 90 50 90 50C90 50 70 20 50 20ZM50 70C38.9543 70 30 61.0457 30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50C70 61.0457 61.0457 70 50 70Z'
              fill='currentColor'
            />

            <circle cx='50' cy='50' r='15' fill='currentColor' strokeWidth='20' />
            <circle cx='55' cy='47' r='6' fill='var(--background)' strokeWidth='20' />
          </svg>

          {/* Arrow Icon */}
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={`text-[var(--muted)] ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points='6,9 12,15 18,9' />
          </svg>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className='border-t border-[var(--border)] p-1'>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='paragliding'
                className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}
              >
                <input
                  type='checkbox'
                  id='paragliding'
                  checked={showParagliding}
                  onChange={handleParaglidingChange}
                  className='mr-2 h-4 w-4 cursor-pointer'
                />
                <Image src='/paraglider.png' alt='Paragliding' width={24} height={24} className='w-6 h-6' />
              </label>

              <label
                htmlFor='weatherStation'
                className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}
              >
                <input
                  type='checkbox'
                  id='weatherStation'
                  checked={showWeatherStations}
                  onChange={handleWeatherStationChange}
                  className='mr-2 h-4 w-4 cursor-pointer'
                />
                <div className='w-6 h-6 flex items-center justify-center '>
                  <WindArrowIcon />
                </div>
              </label>

              <label
                htmlFor='landings'
                className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}
              >
                <input
                  type='checkbox'
                  id='landings'
                  checked={showLandings}
                  onChange={handleLandingsChange}
                  className='mr-2 h-4 w-4 cursor-pointer'
                />
                <div className='w-6 h-6 flex items-center justify-center'>
                  <LandingIcon />
                </div>
              </label>

              <label
                htmlFor='skyways'
                className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}
              >
                <input
                  type='checkbox'
                  id='skyways'
                  checked={showSkyways}
                  onChange={handleSkywaysChange}
                  className='mr-2 h-4 w-4 cursor-pointer'
                />
                <Image src='/thermalkk7.webp' alt='Skyways' width={24} height={24} className='w-6 h-6' />
              </label>

              <label
                htmlFor='thermals'
                className={`flex items-center cursor-pointer ${!isMobile ? 'hover:bg-[var(--accent)]/10' : ''} p-2 rounded select-none`}
              >
                <input
                  type='checkbox'
                  id='thermals'
                  checked={showThermals}
                  onChange={handleThermalsChange}
                  className='mr-2 h-4 w-4 cursor-pointer'
                />
                <Image src='/cumulonimbus.png' alt='Thermals' width={24} height={24} className='px-0.5 w-6 h-6' />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
