import { useEffect, useRef, useState } from 'react';

/**
 * Hook to track page visibility using the Page Visibility API
 * @returns A ref that indicates whether the page is currently visible
 */
export const usePageVisibility = () => {

  const isVisibleRef = useRef<boolean>(true);
  const [isVisibleState, setIsVisibleState] = useState<boolean>(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      setIsVisibleState(isVisibleRef.current);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { isVisibleRef: isVisibleRef, isVisibleState: isVisibleState };
};
