import { useState, useEffect } from 'react';
import { getFullscreenState, setFullscreenState } from '../localstorage/mapStorage';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsFullscreen(getFullscreenState());
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const newFullscreen = !prev;
      setFullscreenState(newFullscreen);
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
