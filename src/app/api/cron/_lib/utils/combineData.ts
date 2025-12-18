import { WeatherDataPointYr1h } from '../../../../../lib/yr/types';
import { WeatherDataPoint } from '../../../../../lib/openMeteo/types';
import { ForecastCache1hr } from '../../../../../lib/supabase/types';

function combineWeatherData(meteoDataPoint: WeatherDataPoint, yrDataPoint?: WeatherDataPointYr1h): ForecastCache1hr {
  let isDay: 0 | 1 = 0;
  if (yrDataPoint?.symbol_code.includes('night')) {
    isDay = 0;
  } else {
    isDay = meteoDataPoint.isDay;
  }

  return {
    // Basic identification
    time: meteoDataPoint.time + ':00Z',
    location_id: '', // This will be set in the cron job
    is_promising: false, // Will be set in the cron job
    is_yr_data: !!yrDataPoint,
    validation_failures: '', // Will be set in the cron job
    validation_warnings: '', // Will be set in the cron job
    updated_at: new Date().toISOString(),

    // Surface conditions
    temperature: yrDataPoint?.air_temperature || meteoDataPoint.temperature2m,
    wind_speed: yrDataPoint?.wind_speed || meteoDataPoint.windSpeed10m,
    wind_direction: Math.trunc(yrDataPoint?.wind_from_direction || meteoDataPoint.windDirection10m),
    wind_gusts: yrDataPoint?.wind_speed_of_gust,
    precipitation: yrDataPoint?.precipitation_amount || meteoDataPoint.precipitation,

    precipitation_max: yrDataPoint?.precipitation_amount_max || 0,
    precipitation_min: yrDataPoint?.precipitation_amount_min || 0,

    precipitation_probability: yrDataPoint?.probability_of_precipitation || meteoDataPoint.precipitationProbability,
    pressure_msl: yrDataPoint?.air_pressure_at_sea_level || meteoDataPoint.pressureMsl,
    weather_code: yrDataPoint?.symbol_code || meteoDataPoint.weatherCode,
    is_day: isDay,

    // Atmospheric conditions - Wind at different pressure levels
    wind_speed_1000hpa: meteoDataPoint.windSpeed1000hPa,
    wind_direction_1000hpa: meteoDataPoint.windDirection1000hPa,
    wind_speed_925hpa: meteoDataPoint.windSpeed925hPa,
    wind_direction_925hpa: meteoDataPoint.windDirection925hPa,
    wind_speed_850hpa: meteoDataPoint.windSpeed850hPa,
    wind_direction_850hpa: meteoDataPoint.windDirection850hPa,
    wind_speed_700hpa: meteoDataPoint.windSpeed700hPa,
    wind_direction_700hpa: meteoDataPoint.windDirection700hPa,

    // Atmospheric conditions - Temperature at different pressure levels
    temperature_1000hpa: meteoDataPoint.temperature1000hPa,
    temperature_925hpa: meteoDataPoint.temperature925hPa,
    temperature_850hpa: meteoDataPoint.temperature850hPa,
    temperature_700hpa: meteoDataPoint.temperature700hPa,

    // Atmospheric conditions - Cloud cover
    cloud_cover: meteoDataPoint.cloudCover,
    cloud_cover_low: meteoDataPoint.cloudCoverLow,
    cloud_cover_mid: meteoDataPoint.cloudCoverMid,
    cloud_cover_high: meteoDataPoint.cloudCoverHigh,

    // Atmospheric conditions - Stability and convection
    cape: meteoDataPoint.cape,
    convective_inhibition: meteoDataPoint.convectiveInhibition,
    lifted_index: meteoDataPoint.liftedIndex,
    boundary_layer_height: meteoDataPoint.boundaryLayerHeight,
    freezing_level_height: meteoDataPoint.freezingLevelHeight,

    // Atmospheric conditions - Geopotential heights
    geopotential_height_1000hpa: meteoDataPoint.geopotentialHeight1000hPa,
    geopotential_height_925hpa: meteoDataPoint.geopotentialHeight925hPa,
    geopotential_height_850hpa: meteoDataPoint.geopotentialHeight850hPa,
    geopotential_height_700hpa: meteoDataPoint.geopotentialHeight700hPa,
  };
}

export function combineDataSources(meteoData: WeatherDataPoint[], yrData: WeatherDataPointYr1h[]): ForecastCache1hr[] {
  const yrDataMap = new Map(yrData.map(dp => [dp.time.slice(0, 16), dp])); // Remove the last 4 characters indicating timezone
  const result = meteoData.map(meteoDp => {
    const yrDp = yrDataMap.get(meteoDp.time);
    if (yrDp) {
      return combineWeatherData(meteoDp, yrDp);
    }
    // If no YR data, still return ForecastCache1hr format
    return combineWeatherData(meteoDp);
  });

  return result;
}
