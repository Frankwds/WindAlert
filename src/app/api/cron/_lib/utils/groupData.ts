import { ForecastCache1hr } from '@/lib/supabase/types';

export function groupByDay(data: ForecastCache1hr[]): Record<string, ForecastCache1hr[]> {
  return data.reduce((acc, dp) => {
    const date = dp.time.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(dp);
    return acc;
  }, {} as Record<string, ForecastCache1hr[]>);
}