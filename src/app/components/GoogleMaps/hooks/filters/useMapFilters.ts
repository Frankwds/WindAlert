import { useState, useCallback } from 'react';
import { type WeatherCondition } from '../../mapControls/PromisingFilter';

interface PromisingFilter {
  selectedDay: number;
  selectedTimeRange: [number, number];
  minPromisingHours: number;
  selectedWeatherConditions: WeatherCondition[];
}

interface UseMapFiltersProps {
  initialShowParaglidingMarkers?: boolean;
  initialShowWeatherStationMarkers?: boolean;
  initialSelectedWindDirections?: string[];
  initialWindFilterAndOperator?: boolean;
  initialPromisingFilter?: PromisingFilter | null;
  initialShowSkywaysLayer?: boolean;
  initialShowThermalsLayer?: boolean;
}

export const useMapFilters = ({
  initialShowParaglidingMarkers = true,
  initialShowWeatherStationMarkers = true,
  initialSelectedWindDirections = [],
  initialWindFilterAndOperator = true,
  initialPromisingFilter = null,
  initialShowSkywaysLayer = false,
  initialShowThermalsLayer = false
}: UseMapFiltersProps = {}) => {
  const [showParaglidingMarkers, setShowParaglidingMarkers] = useState(initialShowParaglidingMarkers);
  const [showWeatherStationMarkers, setShowWeatherStationMarkers] = useState(initialShowWeatherStationMarkers);
  const [selectedWindDirections, setSelectedWindDirections] = useState(initialSelectedWindDirections);
  const [windFilterExpanded, setWindFilterExpanded] = useState(false);
  const [windFilterAndOperator, setWindFilterAndOperator] = useState(initialWindFilterAndOperator);
  const [promisingFilter, setPromisingFilter] = useState(initialPromisingFilter);
  const [isPromisingFilterExpanded, setIsPromisingFilterExpanded] = useState(false);
  const [isFilterControlOpen, setIsFilterControlOpen] = useState(false);
  const [showSkywaysLayer, setShowSkywaysLayer] = useState(initialShowSkywaysLayer);
  const [showThermalsLayer, setShowThermalsLayer] = useState(initialShowThermalsLayer);

  const handleWindDirectionChange = useCallback((directions: string[]) => {
    setSelectedWindDirections(directions);
  }, []);

  const handleWindFilterLogicChange = useCallback(() => {
    setWindFilterAndOperator(prev => !prev);
  }, []);

  const resetFilters = useCallback(() => {
    setShowParaglidingMarkers(true);
    setShowWeatherStationMarkers(true);
    setSelectedWindDirections([]);
    setWindFilterAndOperator(true);
    setPromisingFilter(null);
    setShowSkywaysLayer(false);
    setShowThermalsLayer(false);
  }, []);

  return {
    // State
    showParaglidingMarkers,
    showWeatherStationMarkers,
    selectedWindDirections,
    windFilterExpanded,
    windFilterAndOperator,
    promisingFilter,
    isPromisingFilterExpanded,
    isFilterControlOpen,
    showSkywaysLayer,
    showThermalsLayer,

    // Setters
    setShowParaglidingMarkers,
    setShowWeatherStationMarkers,
    setSelectedWindDirections,
    setWindFilterExpanded,
    setWindFilterAndOperator,
    setPromisingFilter,
    setIsPromisingFilterExpanded,
    setIsFilterControlOpen,
    setShowSkywaysLayer,
    setShowThermalsLayer,

    // Handlers
    handleWindDirectionChange,
    handleWindFilterLogicChange,
    resetFilters
  };
};
