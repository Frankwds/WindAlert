import { useState, useEffect } from 'react';

export const useFullscreen = () => {
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

  return { isFullscreen, toggleFullscreen };
};
