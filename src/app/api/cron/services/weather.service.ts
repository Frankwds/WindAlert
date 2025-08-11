import { WeatherDataPoint, HourlyData, DayResult, AlertRule } from '../types';
import { isWindDirectionGood } from '../lib/wind';
import { WeatherDataPointYr1h } from '../types/yr';
import { getWeatherCode } from '../lib/yr-weather-map';

function combineWeatherData(yrDataPoint: WeatherDataPointYr1h, meteoDataPoint: WeatherDataPoint): WeatherDataPoint {
  return {
    ...meteoDataPoint,
    windSpeed10m: yrDataPoint.wind_speed,
    windDirection10m: yrDataPoint.wind_from_direction,
    windGusts10m: yrDataPoint.wind_speed_of_gust,
    precipitation: yrDataPoint.precipitation_amount,
    cloudCover: yrDataPoint.cloud_area_fraction,
    weatherCode: getWeatherCode(yrDataPoint.symbol_code),
  };
}

function isGoodParaglidingCondition(dp: WeatherDataPoint, alert_rule: AlertRule): boolean {
  const isWindSpeedGood = dp.windSpeed10m >= alert_rule.MIN_WIND_SPEED && dp.windSpeed10m <= alert_rule.MAX_WIND_SPEED;
  const isGustGood = dp.windGusts10m <= alert_rule.MAX_GUST;
  const isGustDifferenceGood = Math.abs(dp.windSpeed10m - dp.windGusts10m) <= alert_rule.MAX_GUST_DIFFERENCE;
  const isPrecipitationGood = dp.precipitation <= alert_rule.MAX_PRECIPITATION;
  const isCapeGood = dp.cape < alert_rule.MAX_CAPE;
  const isLiftedIndexGood = dp.liftedIndex >= alert_rule.MIN_LIFTED_INDEX && dp.liftedIndex <= alert_rule.MAX_LIFTED_INDEX;
  const isCinGood = dp.convectiveInhibition > alert_rule.MIN_CONVECTIVE_INHIBITION;
  const isCloudCoverGood = dp.cloudCover < alert_rule.MAX_CLOUD_COVER;
  const isWindSpeed700hPaGood = dp.windSpeed700hPa <= alert_rule.MAX_WIND_SPEED_700hPa;
  const isWindSpeed850hPaGood = dp.windSpeed850hPa <= alert_rule.MAX_WIND_SPEED_850hPa;
  const isWindSpeed925hPaGood = dp.windSpeed925hPa <= alert_rule.MAX_WIND_SPEED_925hPa;
  const isWindDirectionGoodCheck = isWindDirectionGood(dp.windDirection10m, alert_rule.WIND_DIRECTIONS);
  const isWmoCodeGood = dp.weatherCode <= alert_rule.WMO_CODE_MAX;

  return isWindSpeedGood && isGustGood && isPrecipitationGood && isCapeGood && isLiftedIndexGood && isCinGood && isCloudCoverGood && isWindSpeed700hPaGood && isWindSpeed850hPaGood && isWindSpeed925hPaGood && isWindDirectionGoodCheck && isWmoCodeGood && isGustDifferenceGood;
}

export function combineDataSources(meteoData: WeatherDataPoint[], yrData: WeatherDataPointYr1h[]): WeatherDataPoint[] {
  const yrDataMap = new Map(yrData.map(dp => [dp.time, dp]));

  return meteoData.map(meteoDp => {
    const yrDp = yrDataMap.get(meteoDp.time);
    if (yrDp) {
      return combineWeatherData(yrDp, meteoDp);
    }
    return meteoDp;
  });
}

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

export function validateWeather(groupedData: Record<string, WeatherDataPoint[]>, alert_rule: AlertRule): { overallResult: 'positive' | 'negative', dailyData: DayResult[] } {
  const dailyData: DayResult[] = Object.entries(groupedData).map(([date, dayData]) => {
    const relevantHours = dayData.filter(dp => {
      const hour = new Date(dp.time).getUTCHours();
      return hour >= 8 && hour <= 20;
    });

    const hourlyData: HourlyData[] = relevantHours.map(dp => ({
      isGood: isGoodParaglidingCondition(dp, alert_rule),
      weatherData: dp,
    }));

    let consecutiveGoodHours = 0;
    let hasMetCondition = false;
    if (relevantHours.length >= 3) {
      for (const hour of hourlyData) {
        if (hour.isGood) {
          consecutiveGoodHours++;
          if (consecutiveGoodHours >= 3) {
            hasMetCondition = true;
            break;
          }
        } else {
          consecutiveGoodHours = 0;
        }
      }
    }

    return {
      date,
      result: hasMetCondition ? 'positive' : 'negative',
      hourlyData,
    };
  });

  const overallResult = dailyData.some(day => day.result === 'positive') ? 'positive' : 'negative';

  return {
    overallResult,
    dailyData,
  };
}
