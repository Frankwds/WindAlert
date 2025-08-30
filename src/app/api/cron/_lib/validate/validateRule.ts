import {
  HourlyData,
  DayResult,
  TimeInterval,
  FailureReason,
  WarningReason,
} from '@/lib/openMeteo/types';

import { AlertRule } from '@/lib/common/types/alertRule';
import { Location } from '@/lib/common/types/location';
import { isWindDirectionGood } from './validateWindDirection';
import { ForecastCache1hr } from '@/lib/supabase/types';

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
  dp: ForecastCache1hr,
  alert_rule: AlertRule,
  location: Location
): { isGood: boolean; failures: FailureReason[]; warnings: WarningReason[] } {
  const failures: FailureReason[] = [];
  const warnings: WarningReason[] = [];

  // Surface wind conditions
  if (dp.wind_speed < alert_rule.MIN_WIND_SPEED) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_LOW);
  }
  if (dp.wind_speed > alert_rule.MAX_WIND_SPEED) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_HIGH);
  }
  if (alert_rule.MAX_GUST > 0 && dp.wind_gusts > alert_rule.MAX_GUST) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_GUST_HIGH);
  }
  if (
    alert_rule.MAX_GUST_DIFFERENCE > 0 &&
    Math.abs(dp.wind_speed - dp.wind_gusts) > alert_rule.MAX_GUST_DIFFERENCE
  ) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_GUST_DIFFERENCE);
  }
  if (!isWindDirectionGood(dp.wind_direction, location.windDirections)) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_DIRECTION_BAD);
  }

  // Upper atmosphere wind conditions
  if (dp.wind_speed_925hpa > alert_rule.MAX_WIND_SPEED_925hPa) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_925_HIGH);
  }
  if (dp.wind_speed_850hpa > alert_rule.MAX_WIND_SPEED_850hPa) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_850_HIGH);
  }
  if (dp.wind_speed_700hpa > alert_rule.MAX_WIND_SPEED_700hPa) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_700_HIGH);
  }

  // Wind shear warnings (not failures)
  if (!isWindShearAcceptable(dp.wind_direction, dp.wind_direction_925hpa)) {
    warnings.push(WARNING_DESCRIPTIONS.WIND_SHEAR_925);
  }
  if (!isWindShearAcceptable(dp.wind_direction, dp.wind_direction_850hpa)) {
    warnings.push(WARNING_DESCRIPTIONS.WIND_SHEAR_850);
  }
  if (!isWindShearAcceptable(dp.wind_direction, dp.wind_direction_700hpa)) {
    warnings.push(WARNING_DESCRIPTIONS.WIND_SHEAR_700);
  }

  // Thermal and stability conditions
  if (alert_rule.MAX_CAPE > 0 && dp.cape >= alert_rule.MAX_CAPE) {
    failures.push(FAILURE_DESCRIPTIONS.CAPE_HIGH);
  }
  if (dp.lifted_index < alert_rule.MIN_LIFTED_INDEX) {
    failures.push(FAILURE_DESCRIPTIONS.LIFTED_INDEX_LOW);
  }
  if (dp.lifted_index > alert_rule.MAX_LIFTED_INDEX) {
    failures.push(FAILURE_DESCRIPTIONS.LIFTED_INDEX_HIGH);
  }
  if (dp.convective_inhibition <= alert_rule.MIN_CONVECTIVE_INHIBITION) {
    failures.push(FAILURE_DESCRIPTIONS.CONVECTIVE_INHIBITION_LOW);
  }

  // Visual and precipitation conditions
  const ACCEPTABLE_WEATHER_CODES = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];

  if (dp.precipitation > alert_rule.MAX_PRECIPITATION) {
    failures.push(FAILURE_DESCRIPTIONS.PRECIPITATION_HIGH);
  }
  if (dp.cloud_cover >= alert_rule.MAX_CLOUD_COVER) {
    failures.push(FAILURE_DESCRIPTIONS.CLOUD_COVER_HIGH);
  }
  if (!ACCEPTABLE_WEATHER_CODES.includes(dp.weather_code)) {
    failures.push(FAILURE_DESCRIPTIONS.WEATHER_CODE_BAD);
  }

  return {
    isGood: failures.length === 0,
    failures,
    warnings,
  };
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
  groupedData: Record<string, ForecastCache1hr[]>,
  alert_rule: AlertRule,
  location: Location
): { overallResult: 'positive' | 'negative'; dailyData: DayResult[] } {
  const dailyData: DayResult[] = Object.entries(groupedData).map(([date, dayData]) => {
    // Filter for daylight hours only using the isDay field
    const relevantHours = dayData.filter(dp => dp.is_day === 1);

    // Check conditions for each hour
    const hourlyData: HourlyData[] = relevantHours.map(dp => {
      const result = isGoodParaglidingCondition(dp, alert_rule, location);
      return {
        isGood: result.isGood,
        weatherData: dp,
        failures: result.failures,
        warnings: result.warnings,
      };
    });

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

// Failure descriptions for each type of condition that can fail
const FAILURE_DESCRIPTIONS = {
  WIND_SPEED_LOW: {
    code: 'WIND_SPEED_LOW',
    description: 'Surface wind speed is below the minimum required',
  },
  WIND_SPEED_HIGH: {
    code: 'WIND_SPEED_HIGH',
    description: 'Surface wind speed exceeds the maximum allowed',
  },
  WIND_GUST_HIGH: {
    code: 'WIND_GUST_HIGH',
    description: 'Wind gusts exceed the maximum allowed',
  },
  WIND_GUST_DIFFERENCE: {
    code: 'WIND_GUST_DIFFERENCE',
    description: 'Difference between wind speed and gusts is too high',
  },
  WIND_DIRECTION_BAD: {
    code: 'WIND_DIRECTION_BAD',
    description: 'Surface wind direction is outside the allowed range',
  },
  WIND_SPEED_925_HIGH: {
    code: 'WIND_SPEED_925_HIGH',
    description: 'Wind speed at 925hPa exceeds the maximum allowed',
  },
  WIND_SPEED_850_HIGH: {
    code: 'WIND_SPEED_850_HIGH',
    description: 'Wind speed at 850hPa exceeds the maximum allowed',
  },
  WIND_SPEED_700_HIGH: {
    code: 'WIND_SPEED_700_HIGH',
    description: 'Wind speed at 700hPa exceeds the maximum allowed',
  },
  CAPE_HIGH: {
    code: 'CAPE_HIGH',
    description: 'CAPE value exceeds the maximum allowed',
  },
  LIFTED_INDEX_LOW: {
    code: 'LIFTED_INDEX_LOW',
    description: 'Lifted Index is below the minimum allowed',
  },
  LIFTED_INDEX_HIGH: {
    code: 'LIFTED_INDEX_HIGH',
    description: 'Lifted Index exceeds the maximum allowed',
  },
  CONVECTIVE_INHIBITION_LOW: {
    code: 'CONVECTIVE_INHIBITION_LOW',
    description: 'Not enough convective inhibition',
  },
  PRECIPITATION_HIGH: {
    code: 'PRECIPITATION_HIGH',
    description: 'Precipitation exceeds the maximum allowed',
  },
  CLOUD_COVER_HIGH: {
    code: 'CLOUD_COVER_HIGH',
    description: 'Cloud cover exceeds the maximum allowed',
  },
  WEATHER_CODE_BAD: {
    code: 'WEATHER_CODE_BAD',
    description: 'Current weather conditions are not suitable',
  },
} as const;

// Warning descriptions for conditions that should be noted but don't cause failure
const WARNING_DESCRIPTIONS = {
  WIND_SHEAR_925: {
    code: 'WIND_SHEAR_925',
    description: 'Wind direction at 925hPa differs significantly from ground level',
  },
  WIND_SHEAR_850: {
    code: 'WIND_SHEAR_850',
    description: 'Wind direction at 850hPa differs significantly from ground level',
  },
  WIND_SHEAR_700: {
    code: 'WIND_SHEAR_700',
    description: 'Wind direction at 700hPa differs significantly from ground level',
  },
} as const;
