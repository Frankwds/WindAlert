import { MetObservationsData } from './zod';
import { StationData } from '../../supabase/types';

/**
 * Maps MET observations data to StationData format for database storage
 * Groups observations by station and time, extracting the latest values for each parameter
 */
export function mapMetObservationsToStationData(observationsData: MetObservationsData[]): Omit<StationData, 'id'>[] {
  const stationDataMap = new Map<
    string,
    {
      station_id: string;
      wind_speed?: number;
      wind_gust?: number;
      direction?: number;
      temperature?: number;
      updated_at: string;
    }
  >();

  // Process each data point
  observationsData.forEach(dataPoint => {
    // Extract station ID (remove sensor number suffix like :0)
    const stationId = dataPoint.sourceId.split(':')[0];
    const referenceTime = dataPoint.referenceTime;

    // Get or create station data entry
    let stationData = stationDataMap.get(stationId);
    if (!stationData) {
      stationData = {
        station_id: stationId,
        updated_at: referenceTime,
      };
      stationDataMap.set(stationId, stationData);
    }

    // Update timestamp to the latest one
    if (new Date(referenceTime) > new Date(stationData.updated_at)) {
      stationData.updated_at = referenceTime;
    }

    // Process each observation in the data point
    dataPoint.observations.forEach(observation => {
      const elementId = observation.elementId;
      const value = observation.value;

      switch (elementId) {
        case 'wind_speed':
          stationData.wind_speed = value;
          break;
        case 'max(wind_speed_of_gust PT10M)':
          stationData.wind_gust = value;
          break;
        case 'wind_from_direction':
          stationData.direction = value;
          break;
        case 'air_temperature':
          stationData.temperature = value;
          break;
        default:
          // Skip unknown elements
          break;
      }
    });
  });

  // Convert map to array and filter out incomplete records
  const stationDataArray = Array.from(stationDataMap.values())
    .filter(data => {
      // Only include records that have at least wind_speed and direction
      return data.wind_speed !== undefined && data.direction !== undefined;
    })
    .map(data => ({
      station_id: data.station_id,
      wind_speed: data.wind_speed!,
      wind_gust: data.wind_gust ?? null,
      wind_min_speed: null,
      direction: data.direction!,
      temperature: data.temperature,
      updated_at: data.updated_at,
    }));

  console.log(
    `Mapped ${stationDataArray.length} valid station data records from ${observationsData.length} data points`
  );

  return stationDataArray;
}
