import { useEffect, useRef } from 'react';

/**
 * Hook to track page visibility using the Page Visibility API
 * @returns A ref that indicates whether the page is currently visible
 */
export const usePageVisibility = () => {
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisibleRef;
};
