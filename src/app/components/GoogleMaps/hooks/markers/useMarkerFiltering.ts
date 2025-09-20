import { useMemo } from 'react';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';

interface PromisingFilter {
  selectedDay: number;
  selectedTimeRange: [number, number];
  minPromisingHours: number;
}

interface UseMarkerFilteringProps {
  paraglidingMarkers: google.maps.marker.AdvancedMarkerElement[];
  weatherStationMarkers: google.maps.marker.AdvancedMarkerElement[];
  showParaglidingMarkers: boolean;
  showWeatherStationMarkers: boolean;
  selectedWindDirections: string[];
  windFilterAndOperator: boolean;
  promisingFilter: PromisingFilter | null;
}

export const useMarkerFiltering = ({
  paraglidingMarkers,
  weatherStationMarkers,
  showParaglidingMarkers,
  showWeatherStationMarkers,
  selectedWindDirections,
  windFilterAndOperator,
  promisingFilter
}: UseMarkerFilteringProps) => {
  /**
   * Filters paragliding markers based on promising weather conditions
   */
  const filterParaglidingMarkersByPromising = (markers: google.maps.marker.AdvancedMarkerElement[]) => {
    if (!promisingFilter) return markers;

    return markers.filter(marker => {
      const locationData = (marker as any).locationData as ParaglidingLocationWithForecast;
      const forecast = locationData.forecast_cache;

      if (!forecast) return false;

      const { selectedDay, selectedTimeRange, minPromisingHours } = promisingFilter;

      // Calculate the target date based on day offset
      const dayOffset = selectedDay === 0 ? 0 : selectedDay === 1 ? 1 : 2;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      // Set start and end times based on the filter's time range
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(selectedTimeRange[0]);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(selectedTimeRange[1]);

      // Get forecast entries within the specified time range, sorted by time
      const relevantForecasts = forecast
        .filter(f => {
          const forecastTime = new Date(f.time);
          return forecastTime >= startOfDay && forecastTime < endOfDay;
        })
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      // Check for consecutive promising hours
      let maxConsecutivePromising = 0;
      let currentConsecutive = 0;

      for (const f of relevantForecasts) {
        if (f.is_promising) {
          currentConsecutive++;
          maxConsecutivePromising = Math.max(maxConsecutivePromising, currentConsecutive);
        } else {
          currentConsecutive = 0;
        }
      }

      return maxConsecutivePromising >= minPromisingHours;
    });
  };

  const filterParaglidingMarkersByWindDirection = (markers: google.maps.marker.AdvancedMarkerElement[], windDirections: string[]) => {
    if (windDirections.length === 0) return markers;

    return markers.filter(marker => {
      const locationData = (marker as any).locationData as ParaglidingLocationWithForecast;
      if (windFilterAndOperator) {
        return windDirections.every(direction => locationData[direction.toLowerCase() as keyof ParaglidingLocationWithForecast]);
      } else {
        return windDirections.some(direction => locationData[direction.toLowerCase() as keyof ParaglidingLocationWithForecast]);
      }
    });
  };

  const filteredParaglidingMarkers = useMemo(() => {
    if (!showParaglidingMarkers) return [];

    const promisingFiltered = filterParaglidingMarkersByPromising(paraglidingMarkers);
    return filterParaglidingMarkersByWindDirection(promisingFiltered, selectedWindDirections);
  }, [paraglidingMarkers, showParaglidingMarkers, selectedWindDirections, promisingFilter, windFilterAndOperator]);

  const filteredWeatherStationMarkers = useMemo(() => {
    return showWeatherStationMarkers ? weatherStationMarkers : [];
  }, [weatherStationMarkers, showWeatherStationMarkers]);

  return {
    filteredParaglidingMarkers,
    filteredWeatherStationMarkers,
    filterParaglidingMarkersByPromising,
    filterParaglidingMarkersByWindDirection
  };
};
