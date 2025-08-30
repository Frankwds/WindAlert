import { WeatherDataPointYr1h } from '../../../../../lib/yr/types';
import { WeatherDataPoint } from '../../../../../lib/openMeteo/types';

function combineWeatherData(yrDataPoint: WeatherDataPointYr1h, meteoDataPoint: WeatherDataPoint): WeatherDataPoint {
  return {
    ...meteoDataPoint,
    windSpeed10m: yrDataPoint.wind_speed,
    windDirection10m: yrDataPoint.wind_from_direction,
    windGusts10m: yrDataPoint.wind_speed_of_gust,
    precipitation: yrDataPoint.precipitation_amount,
    cloudCover: yrDataPoint.cloud_area_fraction,
    weatherCode: yrDataPoint.symbol_code,
  };
}

export function combineDataSources(meteoData: WeatherDataPoint[], yrData: WeatherDataPointYr1h[]): WeatherDataPoint[] {
  const yrDataMap = new Map(yrData.map(dp => [dp.time.slice(0, 16), dp]));

  return meteoData.map(meteoDp => {
    const yrDp = yrDataMap.get(meteoDp.time);
    if (yrDp) {
      return combineWeatherData(yrDp, meteoDp);
    }
    return meteoDp;
  });
}

