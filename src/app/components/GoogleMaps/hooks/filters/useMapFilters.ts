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
  initialShowLandingsLayer?: boolean;
  initialSelectedWindDirections?: string[];
  initialWindFilterAndOperator?: boolean;
  initialPromisingFilter?: PromisingFilter | null;
  initialShowSkywaysLayer?: boolean;
  initialShowThermalsLayer?: boolean;
}

export const useMapFilters = ({
  initialShowParaglidingMarkers = true,
  initialShowWeatherStationMarkers = true,
  initialShowLandingsLayer = false,
  initialSelectedWindDirections = [],
  initialWindFilterAndOperator = true,
  initialPromisingFilter = null,
  initialShowSkywaysLayer = false,
  initialShowThermalsLayer = false
}: UseMapFiltersProps = {}) => {
  const [showParaglidingMarkers, setShowParaglidingMarkers] = useState(initialShowParaglidingMarkers);
  const [showWeatherStationMarkers, setShowWeatherStationMarkers] = useState(initialShowWeatherStationMarkers);
  const [showLandingsLayer, setShowLandingsLayer] = useState(initialShowLandingsLayer);
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
    setShowLandingsLayer(false);
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
    showLandingsLayer,
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
    setShowLandingsLayer,
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
