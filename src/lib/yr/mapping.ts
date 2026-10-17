import { metNoResponseSchema, hourlySchema, minimalHourlySchema, sixHourlySchema } from './zod';
import { WeatherDataYr, WeatherDataPointYr1h, WeatherDataPointYr6h } from './types';
import { MinimalForecast } from '../supabase/types';

export function mapYrData(rawData: any): WeatherDataYr {
  const firstMissingIndex = findFirstMissingNext1HoursIndex(rawData.properties.timeseries);
  const slicedHourlyData = rawData.properties.timeseries.slice(0, firstMissingIndex - 6);
  const slicedSixHourData = rawData.properties.timeseries.slice(firstMissingIndex, 80);

  const validatedMetaData = metNoResponseSchema.parse(rawData);
  const validatedHourlyData = hourlySchema.parse(slicedHourlyData);
  const validatedSixHourData = sixHourlySchema.parse(slicedSixHourData);

  const updated_at = validatedMetaData.properties.meta.updated_at;
  const longitude = validatedMetaData.geometry.coordinates[0];
  const latitude = validatedMetaData.geometry.coordinates[1];
  const elevation = validatedMetaData.geometry.coordinates[2];

  const weatherDataPointYr1h: WeatherDataPointYr1h[] = validatedHourlyData.map(item => {
    const dataPoint: WeatherDataPointYr1h = {
      time: item.time,
      ...item.data.instant.details,
      ...item.data.next_1_hours.details,
      symbol_code: item.data.next_1_hours.summary.symbol_code,
      next_6_hours_symbol_code: item.data.next_6_hours.summary.symbol_code,
    };
    return dataPoint;
  });

  const weatherDataPointYr6h: WeatherDataPointYr6h[] = validatedSixHourData.map(item => {
    const dataPoint: WeatherDataPointYr6h = {
      time: item.time,
      ...item.data.instant.details,
      ...item.data.next_6_hours.details,
      symbol_code: item.data.next_6_hours.summary.symbol_code,
    };
    return dataPoint;
  });

  return {
    weatherDataYrHourly: weatherDataPointYr1h,
    weatherDataYrSixHourly: weatherDataPointYr6h,
    updated_at,
    elevation,
    location: {
      latitude,
      longitude,
    },
  };
}

export function mapYrRawHourlyToMinimalForecast(rawData: any): MinimalForecast[] {
  const hourlyData = minimalHourlySchema.parse(
    rawData.properties.timeseries.filter((item: any) => item.data?.next_1_hours)
  );

  return hourlyData.map(hour => ({
    time: hour.time,
    is_day: hour.data.next_1_hours.summary.symbol_code.includes('_night') ? 0 : 1,
    weather_code: hour.data.next_1_hours.summary.symbol_code,
    temperature: hour.data.instant.details.air_temperature,
    wind_speed: hour.data.instant.details.wind_speed,
    wind_gusts: hour.data.instant.details.wind_speed_of_gust,
    wind_direction: hour.data.instant.details.wind_from_direction,
  }));
}

function findFirstMissingNext1HoursIndex(timeseries: any[]): number {
  const index = timeseries.findIndex(item => !item.data.next_1_hours);
  return index === -1 ? timeseries.length : index;
}
