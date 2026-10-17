'use client';

import { createContext, useCallback, useContext, useState } from 'react';

interface GlideMeasurementModeContextType {
  isMeasurementArmed: boolean;
  isMeasurementActive: boolean;
  toggleMeasurementArmed: () => void;
  disarmMeasurement: () => void;
  setMeasurementActive: (isActive: boolean) => void;
  requestMeasurementClear: () => void;
  clearMeasurementRequestId: number;
}

const GlideMeasurementModeContext = createContext<GlideMeasurementModeContextType | undefined>(undefined);

export function GlideMeasurementModeProvider({ children }: { children: React.ReactNode }) {
  const [isMeasurementArmed, setIsMeasurementArmed] = useState(false);
  const [isMeasurementActive, setIsMeasurementActive] = useState(false);
  const [clearMeasurementRequestId, setClearMeasurementRequestId] = useState(0);

  const toggleMeasurementArmed = useCallback(() => {
    setIsMeasurementArmed(isArmed => !isArmed);
  }, []);

  const disarmMeasurement = useCallback(() => {
    setIsMeasurementArmed(false);
  }, []);

  const setMeasurementActive = useCallback((isActive: boolean) => {
    setIsMeasurementActive(isActive);
  }, []);

  const requestMeasurementClear = useCallback(() => {
    setIsMeasurementArmed(false);
    setIsMeasurementActive(false);
    setClearMeasurementRequestId(requestId => requestId + 1);
  }, []);

  return (
    <GlideMeasurementModeContext.Provider
      value={{
        isMeasurementArmed,
        isMeasurementActive,
        toggleMeasurementArmed,
        disarmMeasurement,
        setMeasurementActive,
        requestMeasurementClear,
        clearMeasurementRequestId,
      }}
    >
      {children}
    </GlideMeasurementModeContext.Provider>
  );
}

export function useGlideMeasurementMode() {
  const context = useContext(GlideMeasurementModeContext);
  if (!context) {
    throw new Error('useGlideMeasurementMode must be used within a GlideMeasurementModeProvider');
  }

  return context;
}
