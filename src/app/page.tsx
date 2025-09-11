'use client';

import { useState, useEffect } from 'react';
import GoogleMaps from './components/GoogleMaps/GoogleMaps'

export default function Home() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const savedFullscreen = localStorage.getItem('windlord-fullscreen');
    if (savedFullscreen !== null) {
      setIsFullscreen(JSON.parse(savedFullscreen));
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const newFullscreen = !prev;
      localStorage.setItem('windlord-fullscreen', JSON.stringify(newFullscreen));
      return newFullscreen;
    });
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('fullscreen-map-active');
    } else {
      document.body.classList.remove('fullscreen-map-active');
    }
  }, [isFullscreen]);

  return (
    <main className="flex-1 w-full h-full ">
      <GoogleMaps isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
    </main>
  );
}
