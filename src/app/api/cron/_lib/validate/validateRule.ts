import {
  WeatherDataPoint,
  HourlyData,
  DayResult,
  TimeInterval,
} from '../../../../../lib/openMeteo/types';
import { AlertRule } from '@/lib/common/types/alertRule';
import { Location } from '@/lib/common/types/location';
import { isWindDirectionGood } from './validateWindDirection';

interface WeatherInterval {
  start: number | null;
  end: number | null;
}

interface IntervalResult {
  positiveIntervals: TimeInterval[];
  hasMetCondition: boolean;
}

/**
 * Validates if weather conditions are suitable for paragliding based on multiple criteria
 */
function isGoodParaglidingCondition(
  dp: WeatherDataPoint,
  alert_rule: AlertRule,
  location: Location
): boolean {
  // Surface wind conditions
  const isWindSpeedInRange =
    dp.windSpeed10m >= alert_rule.MIN_WIND_SPEED && dp.windSpeed10m <= alert_rule.MAX_WIND_SPEED;
  const isGustBelowMax = alert_rule.MAX_GUST === 0 || dp.windGusts10m <= alert_rule.MAX_GUST;
  const isGustDifferenceAcceptable =
    alert_rule.MAX_GUST_DIFFERENCE === 0 ||
    Math.abs(dp.windSpeed10m - dp.windGusts10m) <= alert_rule.MAX_GUST_DIFFERENCE;
  const isWindDirectionAcceptable = isWindDirectionGood(
    dp.windDirection10m,
    location.windDirections
  );

  const surfaceWindConditions = {
    speed: isWindSpeedInRange,
    gusts: isGustBelowMax,
    gustDifference: isGustDifferenceAcceptable,
    direction: isWindDirectionAcceptable,
  };

  // Upper atmosphere wind conditions (at different pressure levels)
  const upperWindConditions = {
    at925hPa: dp.windSpeed925hPa <= alert_rule.MAX_WIND_SPEED_925hPa,
    at850hPa: dp.windSpeed850hPa <= alert_rule.MAX_WIND_SPEED_850hPa,
    at700hPa: dp.windSpeed700hPa <= alert_rule.MAX_WIND_SPEED_700hPa,
  };

  // Thermal and stability conditions
  const isCapeAcceptable = alert_rule.MAX_CAPE === 0 || dp.cape < alert_rule.MAX_CAPE;
  const isLiftedIndexInRange =
    dp.liftedIndex >= alert_rule.MIN_LIFTED_INDEX && dp.liftedIndex <= alert_rule.MAX_LIFTED_INDEX;
  const hasEnoughConvection = dp.convectiveInhibition > alert_rule.MIN_CONVECTIVE_INHIBITION;

  const thermalConditions = {
    cape: isCapeAcceptable,
    liftedIndex: isLiftedIndexInRange,
    convectiveInhibition: hasEnoughConvection,
  };

  // Visual and precipitation conditions
  const ACCEPTABLE_WEATHER_CODES = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];

  const isPrecipitationAcceptable = dp.precipitation <= alert_rule.MAX_PRECIPITATION;
  const isCloudCoverAcceptable = dp.cloudCover < alert_rule.MAX_CLOUD_COVER;
  const isWeatherCodeAcceptable = ACCEPTABLE_WEATHER_CODES.includes(dp.weatherCode);

  const visualConditions = {
    precipitation: isPrecipitationAcceptable,
    cloudCover: isCloudCoverAcceptable,
    weatherCode: isWeatherCodeAcceptable,
  };

  // Check if all conditions in each category are met
  const isSurfaceWindGood = Object.values(surfaceWindConditions).every(condition => condition);
  const isUpperWindGood = Object.values(upperWindConditions).every(condition => condition);
  const isThermalGood = Object.values(thermalConditions).every(condition => condition);
  const isVisualGood = Object.values(visualConditions).every(condition => condition);

  return isSurfaceWindGood && isUpperWindGood && isThermalGood && isVisualGood;
}

// TODO, make these configurable per rule
const MIN_CONSECUTIVE_HOURS = 3;
const DAYTIME_START_HOUR = 8;
const DAYTIME_END_HOUR = 20;

/**
 * Creates a formatted time interval string
 */
function createTimeInterval(startHour: number, endHour: number): TimeInterval {
  return {
    start: `${startHour.toString().padStart(2, '0')}:00`,
    end: `${endHour.toString().padStart(2, '0')}:00`,
  };
}

/**
 * Finds intervals of consecutive good weather conditions
 */
function findConsecutiveGoodIntervals(hourlyData: HourlyData[]): IntervalResult {
  const positiveIntervals: TimeInterval[] = [];
  let hasMetCondition = false;
  let consecutiveGoodHours = 0;
  let intervalStart: number | null = null;

  // Helper function to add a valid interval to the results
  const addIntervalIfValid = (start: number, end: number, goodHours: number) => {
    if (goodHours >= MIN_CONSECUTIVE_HOURS) {
      positiveIntervals.push(createTimeInterval(start, end));
      hasMetCondition = true;
    }
  };

  hourlyData.forEach((hour, index) => {
    const currentHour = new Date(hour.weatherData.time).getHours();
    const isLastHour = index === hourlyData.length - 1;

    if (hour.isGood) {
      consecutiveGoodHours++;
      intervalStart = intervalStart ?? currentHour;

      if (isLastHour) {
        addIntervalIfValid(intervalStart, currentHour + 1, consecutiveGoodHours);
      }
    } else {
      // End of a good weather streak
      if (intervalStart !== null) {
        addIntervalIfValid(intervalStart, currentHour, consecutiveGoodHours);
        intervalStart = null;
      }
      consecutiveGoodHours = 0;
    }
  });

  return { positiveIntervals, hasMetCondition };
}

/**
 * Validates weather data against alert rules and returns periods of good conditions
 */
export function validateWeather(
  groupedData: Record<string, WeatherDataPoint[]>,
  alert_rule: AlertRule,
  location: Location
): { overallResult: 'positive' | 'negative'; dailyData: DayResult[] } {
  const dailyData: DayResult[] = Object.entries(groupedData).map(([date, dayData]) => {
    // Filter for daytime hours only
    const relevantHours = dayData.filter(dp => {
      const hour = new Date(dp.time).getHours();
      return hour >= DAYTIME_START_HOUR && hour <= DAYTIME_END_HOUR;
    });

    // Check conditions for each hour
    const hourlyData: HourlyData[] = relevantHours.map(dp => ({
      isGood: isGoodParaglidingCondition(dp, alert_rule, location),
      weatherData: dp,
    }));

    // Find intervals
    const { positiveIntervals, hasMetCondition } = findConsecutiveGoodIntervals(hourlyData);

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
