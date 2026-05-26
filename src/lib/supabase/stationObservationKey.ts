import { StationData } from './types';

export const stationLatestObservationKey = (data: StationData): string => {
  return data.updated_at;
};
