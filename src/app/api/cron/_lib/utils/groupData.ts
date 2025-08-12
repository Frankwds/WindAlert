import { WeatherDataPoint } from '../../../_lib/types/openMeteo';

export function groupByDay(data: WeatherDataPoint[]): Record<string, WeatherDataPoint[]> {
    return data.reduce((acc, dp) => {
        const date = dp.time.split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(dp);
        return acc;
    }, {} as Record<string, WeatherDataPoint[]>);
}