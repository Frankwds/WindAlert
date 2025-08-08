import { WeatherDataPoint, HourlyData, DayResult, AlertRule } from '../types';
import { isWindDirectionGood } from '../lib/wind';

function isGoodParaglidingCondition(dp: WeatherDataPoint, alert_rule: AlertRule): boolean {
  const isWindSpeedGood = dp.windSpeed10m >= alert_rule.MIN_WIND_SPEED && dp.windSpeed10m <= alert_rule.MAX_WIND_SPEED;
  const isGustGood = dp.windGusts10m <= alert_rule.MAX_GUST;
  const isPrecipitationGood = dp.precipitation <= alert_rule.MAX_PRECIPITATION;
  const isWeatherCodeGood = !alert_rule.THUNDERSTORM_CODES.includes(dp.weatherCode);
  const isCapeGood = dp.cape < alert_rule.MAX_CAPE;
  const isLiftedIndexGood = dp.liftedIndex >= alert_rule.MIN_LIFTED_INDEX && dp.liftedIndex <= alert_rule.MAX_LIFTED_INDEX;
  const isCinGood = dp.convectiveInhibition > alert_rule.MIN_CONVECTIVE_INHIBITION;
  const isCloudCoverGood = dp.cloudCover < alert_rule.MAX_CLOUD_COVER;
  const isWindSpeed700hPaGood = dp.windSpeed700hPa <= alert_rule.MAX_WIND_SPEED_700hPa;
  const isWindSpeed850hPaGood = dp.windSpeed850hPa <= alert_rule.MAX_WIND_SPEED_850hPa;
  const isWindSpeed925hPaGood = dp.windSpeed925hPa <= alert_rule.MAX_WIND_SPEED_925hPa;
  const isWindDirectionGoodCheck = isWindDirectionGood(dp.windDirection10m, alert_rule.WIND_DIRECTIONS);

  return isWindSpeedGood && isGustGood && isPrecipitationGood && isWeatherCodeGood && isCapeGood && isLiftedIndexGood && isCinGood && isCloudCoverGood && isWindSpeed700hPaGood && isWindSpeed850hPaGood && isWindSpeed925hPaGood && isWindDirectionGoodCheck;
}

export function validateWeather(data: WeatherDataPoint[], alert_rule: AlertRule): { overallResult: 'positive' | 'negative', dailyData: DayResult[] } {
  const groupedByDay = data.reduce((acc, dp) => {
    const date = dp.time.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(dp);
    return acc;
  }, {} as Record<string, WeatherDataPoint[]>);

  const dailyData: DayResult[] = Object.entries(groupedByDay).map(([date, dayData]) => {
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
