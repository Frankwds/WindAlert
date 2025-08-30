import { WeatherDataPointYr1h } from '../../../../../lib/yr/types';
import { WeatherDataPoint } from '../../../../../lib/openMeteo/types';
import { ForecastCache1hr } from '../../../../../lib/supabase/types';

function combineWeatherData(yrDataPoint: WeatherDataPointYr1h, meteoDataPoint: WeatherDataPoint): ForecastCache1hr {
  return {
    // Basic identification
    time: meteoDataPoint.time,
    location_id: '', // This will be set in the cron job
    isPromising: false, // Will be set in the cron job

    // Surface conditions
    temperature: yrDataPoint.air_temperature,
    windSpeed: yrDataPoint.wind_speed,
    windDirection: yrDataPoint.wind_from_direction,
    windGusts: yrDataPoint.wind_speed_of_gust,
    precipitation: yrDataPoint.precipitation_amount,
    precipitationProbability: yrDataPoint.probability_of_precipitation,
    pressureMsl: yrDataPoint.air_pressure_at_sea_level,
    weatherCode: yrDataPoint.symbol_code,
    isDay: meteoDataPoint.isDay,

    // Atmospheric conditions - Wind at different pressure levels
    windSpeed1000hPa: meteoDataPoint.windSpeed1000hPa,
    windDirection1000hPa: meteoDataPoint.windDirection1000hPa,
    windSpeed925hPa: meteoDataPoint.windSpeed925hPa,
    windDirection925hPa: meteoDataPoint.windDirection925hPa,
    windSpeed850hPa: meteoDataPoint.windSpeed850hPa,
    windDirection850hPa: meteoDataPoint.windDirection850hPa,
    windSpeed700hPa: meteoDataPoint.windSpeed700hPa,
    windDirection700hPa: meteoDataPoint.windDirection700hPa,

    // Atmospheric conditions - Temperature at different pressure levels
    temperature1000hPa: meteoDataPoint.temperature1000hPa,
    temperature925hPa: meteoDataPoint.temperature925hPa,
    temperature850hPa: meteoDataPoint.temperature850hPa,
    temperature700hPa: meteoDataPoint.temperature700hPa,

    // Atmospheric conditions - Cloud cover
    cloudCover: meteoDataPoint.cloudCover,
    cloudCoverLow: meteoDataPoint.cloudCoverLow,
    cloudCoverMid: meteoDataPoint.cloudCoverMid,
    cloudCoverHigh: meteoDataPoint.cloudCoverHigh,

    // Atmospheric conditions - Stability and convection
    cape: meteoDataPoint.cape,
    convectiveInhibition: meteoDataPoint.convectiveInhibition,
    liftedIndex: meteoDataPoint.liftedIndex,
    boundaryLayerHeight: meteoDataPoint.boundaryLayerHeight,
    freezingLevelHeight: meteoDataPoint.freezingLevelHeight,

    // Atmospheric conditions - Geopotential heights
    geopotentialHeight1000hPa: meteoDataPoint.geopotentialHeight1000hPa,
    geopotentialHeight925hPa: meteoDataPoint.geopotentialHeight925hPa,
    geopotentialHeight850hPa: meteoDataPoint.geopotentialHeight850hPa,
    geopotentialHeight700hPa: meteoDataPoint.geopotentialHeight700hPa,
  };
}

export function combineDataSources(meteoData: WeatherDataPoint[], yrData: WeatherDataPointYr1h[]): ForecastCache1hr[] {
  const yrDataMap = new Map(yrData.map(dp => [dp.time.slice(0, 16), dp]));

  return meteoData.map(meteoDp => {
    const yrDp = yrDataMap.get(meteoDp.time);
    if (yrDp) {
      return combineWeatherData(yrDp, meteoDp);
    }
    // If no YR data, still return ForecastCache1hr format
    return combineWeatherData({
      time: meteoDp.time,
      wind_speed: 0,
      wind_from_direction: 0,
      wind_speed_of_gust: 0,
      precipitation_amount: 0,
      cloud_area_fraction: 0,
      symbol_code: '',
    } as WeatherDataPointYr1h, meteoDp);
  });
}

