import {
  WeatherDataPoint,
  HourlyData,
  DayResult,
  TimeInterval,
} from '../../../../../lib/openMeteo/types';
import { AlertRule } from '@/lib/common/types/alertRule';
import { Location } from '@/lib/common/types/location';
import { isWindDirectionGood } from './validateWindDirection';

/**
 * Checks if the difference between ground wind direction and altitude wind direction
 * is within acceptable limits (less than 90 degrees)
 */
function isWindShearAcceptable(groundDirection: number, altitudeDirection: number): boolean {
  // Calculate the absolute difference between wind directions
  let difference = Math.abs(groundDirection - altitudeDirection);
  // Normalize the difference to handle the circular nature of degrees (0-360)
  if (difference > 180) {
    difference = 360 - difference;
  }
  // Check if the difference is less than 90 degrees
  return difference <= 90;
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
    at925hPa: {
      speed: dp.windSpeed925hPa <= alert_rule.MAX_WIND_SPEED_925hPa,
      shear: isWindShearAcceptable(dp.windDirection10m, dp.windDirection925hPa),
    },
    at850hPa: {
      speed: dp.windSpeed850hPa <= alert_rule.MAX_WIND_SPEED_850hPa,
      shear: isWindShearAcceptable(dp.windDirection10m, dp.windDirection850hPa),
    },
    at700hPa: {
      speed: dp.windSpeed700hPa <= alert_rule.MAX_WIND_SPEED_700hPa,
      shear: isWindShearAcceptable(dp.windDirection10m, dp.windDirection700hPa),
    },
  };

  // Check if all upper wind conditions are met (both speed and wind shear for each level)
  const isUpperWindGood = Object.values(upperWindConditions).every(level =>
    Object.values(level).every(condition => condition)
  );

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
  const isThermalGood = Object.values(thermalConditions).every(condition => condition);
  const isVisualGood = Object.values(visualConditions).every(condition => condition);

  return isSurfaceWindGood && isUpperWindGood && isThermalGood && isVisualGood;
}

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
function findConsecutiveGoodIntervals(
  hourlyData: HourlyData[],
  minConsecutiveHours: number
): TimeInterval[] {
  const positiveIntervals: TimeInterval[] = [];
  let consecutiveGoodHours = 0;
  let intervalStart: number | null = null;

  // Helper function to add a valid interval to the results
  const addIntervalIfValid = (start: number, end: number, goodHours: number) => {
    if (goodHours >= minConsecutiveHours) {
      positiveIntervals.push(createTimeInterval(start, end));
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

  return positiveIntervals;
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
    // Filter for daylight hours only using the isDay field
    const relevantHours = dayData.filter(dp => dp.isDay);

    // Check conditions for each hour
    const hourlyData: HourlyData[] = relevantHours.map(dp => ({
      isGood: isGoodParaglidingCondition(dp, alert_rule, location),
      weatherData: dp,
    }));

    // Find intervals
    const positiveIntervals = findConsecutiveGoodIntervals(
      hourlyData,
      alert_rule.MIN_CONSECUTIVE_HOURS
    );

    return {
      date,
      result: positiveIntervals.length > 0 ? 'positive' : 'negative',
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
