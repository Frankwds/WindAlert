import { WeatherDataPointYr1h } from '../../../../../lib/yr/types';
import { WeatherDataPoint } from '../../../../../lib/openMeteo/types';
import { ForecastCache1hr } from '../../../../../lib/supabase/types';

function combineWeatherData(yrDataPoint: WeatherDataPointYr1h, meteoDataPoint: WeatherDataPoint): ForecastCache1hr {
  return {
    // Basic identification
    time: meteoDataPoint.time,
    location_id: '', // This will be set in the cron job
    is_promising: false, // Will be set in the cron job

    // Surface conditions
    temperature: yrDataPoint.air_temperature,
    wind_speed: yrDataPoint.wind_speed,
    wind_direction: yrDataPoint.wind_from_direction,
    wind_gusts: yrDataPoint.wind_speed_of_gust,
    precipitation: yrDataPoint.precipitation_amount,
    precipitation_probability: yrDataPoint.probability_of_precipitation,
    pressure_msl: yrDataPoint.air_pressure_at_sea_level,
    weather_code: yrDataPoint.symbol_code,
    is_day: meteoDataPoint.isDay,

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

