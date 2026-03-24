import { useCallback } from 'react';

/** Passed to `closeOverlays({ keep })` so named UI stays open while the rest dismisses. */
export type OverlayCloseKeep =
  | 'infowindow'
  | 'promisingfilter'
  | 'windfilter'
  | 'filtercontrol';

export type CloseOverlaysFn = (options?: { keep?: OverlayCloseKeep }) => void;

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
  closeInfoWindow,
}: UseOverlayManagementProps) => {
  const closeOverlays = useCallback<CloseOverlaysFn>(
    ({ keep } = {}) => {
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
    },
    [setWindFilterExpanded, setIsPromisingFilterExpanded, setIsFilterControlOpen, closeInfoWindow]
  );

  return {
    closeOverlays,
  };
};
