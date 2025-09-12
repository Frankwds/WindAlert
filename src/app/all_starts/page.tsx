'use client';

import { useState } from 'react';
import GoogleMapsAll from '@/app/components/GoogleMaps/GoogleMapsAll';

export default function AllStartsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full h-screen">
      <GoogleMapsAll
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
