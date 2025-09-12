import { useCallback } from 'react';

interface UseOverlayManagementProps {
  setWindFilterExpanded: (expanded: boolean) => void;
  setIsPromisingFilterExpanded: (expanded: boolean) => void;
  setIsFilterControlOpen: (open: boolean) => void;
  closeInfoWindow: () => void;
}

export const useOverlayManagement = ({
  setWindFilterExpanded,
  setIsPromisingFilterExpanded,
  setIsFilterControlOpen,
  closeInfoWindow
}: UseOverlayManagementProps) => {
  const closeOverlays = useCallback(({ keep = "" }: { keep?: string } = {}) => {
    if (keep !== 'promisingfilter') {
      setIsPromisingFilterExpanded(false);
    }
    if (keep !== 'windfilter') {
      setWindFilterExpanded(false);
    }
    if (keep !== 'filtercontrol') {
      setIsFilterControlOpen(false);
    }
    if (keep !== 'infowindow') {
      closeInfoWindow();
    }
  }, [setWindFilterExpanded, setIsPromisingFilterExpanded, setIsFilterControlOpen, closeInfoWindow]);

  return {
    closeOverlays
  };
};
