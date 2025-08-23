import {
  WeatherDataPoint,
  HourlyData,
  DayResult,
  TimeInterval,
} from '../../../../../lib/openMeteo/types';
import { AlertRule } from '@/lib/common/types/alertRule';
import { Location } from '@/lib/common/types/location';
import { isWindDirectionGood } from './validateWindDirection';

function isGoodParaglidingCondition(
  dp: WeatherDataPoint,
  alert_rule: AlertRule,
  location: Location
): boolean {
  const isWindSpeedGood =
    dp.windSpeed10m >= alert_rule.MIN_WIND_SPEED && dp.windSpeed10m <= alert_rule.MAX_WIND_SPEED;
  const isGustGood = dp.windGusts10m <= alert_rule.MAX_GUST || alert_rule.MAX_GUST === 0;
  const isGustDifferenceGood =
    Math.abs(dp.windSpeed10m - dp.windGusts10m) <= alert_rule.MAX_GUST_DIFFERENCE ||
    alert_rule.MAX_GUST_DIFFERENCE === 0;
  const isPrecipitationGood = dp.precipitation <= alert_rule.MAX_PRECIPITATION;
  const isCapeGood = dp.cape < alert_rule.MAX_CAPE || alert_rule.MAX_CAPE === 0;
  const isLiftedIndexGood =
    dp.liftedIndex >= alert_rule.MIN_LIFTED_INDEX && dp.liftedIndex <= alert_rule.MAX_LIFTED_INDEX;
  const isCinGood = dp.convectiveInhibition > alert_rule.MIN_CONVECTIVE_INHIBITION;
  const isCloudCoverGood = dp.cloudCover < alert_rule.MAX_CLOUD_COVER;
  const isWindSpeed925hPaGood = dp.windSpeed925hPa <= alert_rule.MAX_WIND_SPEED_925hPa;
  const isWindSpeed850hPaGood = dp.windSpeed850hPa <= alert_rule.MAX_WIND_SPEED_850hPa;
  const isWindSpeed700hPaGood = dp.windSpeed700hPa <= alert_rule.MAX_WIND_SPEED_700hPa;
  const isWindDirectionGoodCheck = isWindDirectionGood(
    dp.windDirection10m,
    location.windDirections
  );
  const isWmoCodeGood = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'].includes(
    dp.weatherCode
  );

  return (
    isWindSpeedGood &&
    isGustGood &&
    isPrecipitationGood &&
    isCapeGood &&
    isLiftedIndexGood &&
    isCinGood &&
    isCloudCoverGood &&
    isWindSpeed700hPaGood &&
    isWindSpeed850hPaGood &&
    isWindSpeed925hPaGood &&
    isWindDirectionGoodCheck &&
    isWmoCodeGood &&
    isGustDifferenceGood
  );
}

export function validateWeather(
  groupedData: Record<string, WeatherDataPoint[]>,
  alert_rule: AlertRule,
  location: Location
): { overallResult: 'positive' | 'negative'; dailyData: DayResult[] } {
  const dailyData: DayResult[] = Object.entries(groupedData).map(([date, dayData]) => {
    const relevantHours = dayData.filter(dp => {
      const hour = new Date(dp.time).getHours();
      return hour >= 8 && hour <= 20;
    });

    const hourlyData: HourlyData[] = relevantHours.map(dp => ({
      isGood: isGoodParaglidingCondition(dp, alert_rule, location),
      weatherData: dp,
    }));

    let consecutiveGoodHours = 0;
    let hasMetCondition = false;
    let currentInterval: { start: number | null; end: number | null } = { start: null, end: null };
    const positiveIntervals: TimeInterval[] = [];

    if (relevantHours.length >= 3) {
      for (let i = 0; i < hourlyData.length; i++) {
        const hour = hourlyData[i];
        const time = new Date(hour.weatherData.time);

        if (hour.isGood) {
          consecutiveGoodHours++;
          // Start a new interval if we don't have one
          if (currentInterval.start === null) {
            currentInterval.start = time.getHours();
          }
          // If we have 3 consecutive good hours, mark as met and update the end time
          if (consecutiveGoodHours >= 3) {
            hasMetCondition = true;
            currentInterval.end = time.getHours();
          }
          // If this is the last hour or next hour is not good, save the interval
          if (i === hourlyData.length - 1 || !hourlyData[i + 1]?.isGood) {
            if (
              currentInterval.start !== null &&
              currentInterval.end !== null &&
              consecutiveGoodHours >= 3
            ) {
              positiveIntervals.push({
                start: `${currentInterval.start.toString().padStart(2, '0')}:00`,
                end: `${(currentInterval.end + 1).toString().padStart(2, '0')}:00`,
              });
            }
            currentInterval = { start: null, end: null };
          }
        } else {
          // If we had a valid interval, save it
          if (
            currentInterval.start !== null &&
            currentInterval.end !== null &&
            consecutiveGoodHours >= 3
          ) {
            positiveIntervals.push({
              start: `${currentInterval.start.toString().padStart(2, '0')}:00`,
              end: `${time.getHours().toString().padStart(2, '0')}:00`,
            });
          }
          currentInterval = { start: null, end: null };
          consecutiveGoodHours = 0;
        }
      }
    }

    return {
      date,
      result: hasMetCondition ? 'positive' : 'negative',
      hourlyData,
      positiveIntervals,
    };
  });

  const overallResult = dailyData.some(day => day.result === 'positive') ? 'positive' : 'negative';

  return {
    overallResult,
    dailyData,
  };
}
