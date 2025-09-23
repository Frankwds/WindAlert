'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MapLayerToggleProps {
  map: google.maps.Map | null;
  className?: string;
  initialMapTypeSatellite?: boolean;
}

export const MapLayerToggle: React.FC<MapLayerToggleProps> = ({ map, className = '', initialMapTypeSatellite = false }) => {
  const [isSatellite, setIsSatellite] = useState(initialMapTypeSatellite);

  useEffect(() => {
    if (map) {
      setIsSatellite(map.getMapTypeId() === google.maps.MapTypeId.SATELLITE);
    }
  }, [map]);

  const handleToggle = () => {
    if (!map) return;

    const newMapType = isSatellite
      ? google.maps.MapTypeId.TERRAIN
      : google.maps.MapTypeId.HYBRID;

    map.setMapTypeId(newMapType);
    setIsSatellite(!isSatellite);
  };

  if (!map) return null;

  return (
    <div className={`absolute bottom-3 left-3 z-10 ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer ring-2 ring-[var(--accent)] select-none`}
          style={{ display: isSatellite ? 'none' : 'block' }}
        >
          <Image
            src="/satellite.png"
            alt="Satellite"
            fill
            sizes="64px"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Satellite</span>
          </div>
        </button>

        <button
          onClick={handleToggle}
          className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer ring-2 ring-[var(--accent)] select-none`}
          style={{ display: isSatellite ? 'block' : 'none' }}
        >
          <Image
            src="/terrain.png"
            alt="Terrain"
            fill
            sizes="64px"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Terrain</span>
          </div>
        </button>
      </div>
    </div>
  );
};
