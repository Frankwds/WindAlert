'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MapLayerToggleProps {
  map: google.maps.Map | null;
  className?: string;
  initialMapType?: 'terrain' | 'satellite' | 'osm';
  onMapTypeChange?: (mapType: 'terrain' | 'satellite' | 'osm') => void;
}

export const MapLayerToggle: React.FC<MapLayerToggleProps> = ({
  map,
  className = '',
  initialMapType = 'terrain',
  onMapTypeChange,
}) => {
  const [currentMapType, setCurrentMapType] = useState<'terrain' | 'satellite' | 'osm'>(initialMapType);

  useEffect(() => {
    if (map) {
      const mapTypeId = map.getMapTypeId();
      if (mapTypeId === 'osm') {
        setCurrentMapType('osm');
      } else if (mapTypeId === google.maps.MapTypeId.SATELLITE || mapTypeId === google.maps.MapTypeId.HYBRID) {
        setCurrentMapType('satellite');
      } else {
        setCurrentMapType('terrain');
      }
    }
  }, [map]);

  const handleToggle = () => {
    if (!map) return;

    const nextMapType = currentMapType === 'terrain' ? 'satellite' : currentMapType === 'satellite' ? 'osm' : 'terrain';

    const mapTypeId =
      nextMapType === 'osm'
        ? 'osm'
        : nextMapType === 'satellite'
          ? google.maps.MapTypeId.HYBRID
          : google.maps.MapTypeId.TERRAIN;

    map.setMapTypeId(mapTypeId);
    setCurrentMapType(nextMapType);
    onMapTypeChange?.(nextMapType);
  };

  if (!map) return null;

  const getNextMapType = () => {
    return currentMapType === 'terrain' ? 'satellite' : currentMapType === 'satellite' ? 'osm' : 'terrain';
  };

  const nextMapType = getNextMapType();

  return (
    <div className={`absolute bottom-3 left-3 z-10 ${className}`}>
      <div className='flex gap-2'>
        <button
          onClick={handleToggle}
          className='relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer ring-2 ring-[var(--accent)] select-none transition-all duration-200 hover:scale-105'
        >
          {nextMapType === 'terrain' && <Image src='/terrain.png' alt='Terrain' fill sizes='64px' />}
          {nextMapType === 'satellite' && <Image src='/satellite.png' alt='Satellite' fill sizes='64px' />}
          {nextMapType === 'osm' && <Image src='/osm.png' alt='OpenStreetMap' fill sizes='64px' />}
          <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
            <span className='text-white text-xs font-bold'>
              {nextMapType === 'terrain' ? 'Terrain' : nextMapType === 'satellite' ? 'Satellite' : 'OSM'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
