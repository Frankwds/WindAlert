import {
  WeatherDataPoint,
  FailureReason,
  WarningReason,
} from '@/lib/openMeteo/types';

import { AlertRule } from '@/lib/common/types/alertRule';

function isWindDirectionGood(
  windDirection: number,
  location: string[]
): boolean {
  const directions = [
    { key: 'n', min: 337.5, max: 22.5 },
    { key: 'ne', min: 22.5, max: 67.5 },
    { key: 'e', min: 67.5, max: 112.5 },
    { key: 'se', min: 112.5, max: 157.5 },
    { key: 's', min: 157.5, max: 202.5 },
    { key: 'sw', min: 202.5, max: 247.5 },
    { key: 'w', min: 247.5, max: 292.5 },
    { key: 'nw', min: 292.5, max: 337.5 },
  ];

  for (const dir of directions) {
    if (location.includes(dir.key)) {
      if (dir.key === 'n') {
        if (windDirection >= dir.min || windDirection < dir.max) {
          return true;
        }
      } else {
        if (windDirection >= dir.min && windDirection < dir.max) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks if the difference between ground wind direction and altitude wind direction
 * is within acceptable limits (less than 90 degrees)
 */
function isWindShearAcceptable(
  groundDirection: number,
  altitudeDirection: number
): boolean {
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
export function isGoodParaglidingCondition(
  dp: WeatherDataPoint,
  alert_rule: AlertRule,
  location: string[]
): { isGood: boolean; failures: FailureReason[]; warnings: WarningReason[] } {
  const failures: FailureReason[] = [];
  const warnings: WarningReason[] = [];

  // Surface wind conditions
  if (dp.windSpeed10m < alert_rule.MIN_WIND_SPEED) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_LOW);
  }
  if (dp.windSpeed10m > alert_rule.MAX_WIND_SPEED) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_HIGH);
  }
  if (alert_rule.MAX_GUST > 0 && dp.windGusts10m > alert_rule.MAX_GUST) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_GUST_HIGH);
  }
  if (
    alert_rule.MAX_GUST_DIFFERENCE > 0 &&
    Math.abs(dp.windSpeed10m - dp.windGusts10m) >
    alert_rule.MAX_GUST_DIFFERENCE
  ) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_GUST_DIFFERENCE);
  }
  if (!isWindDirectionGood(dp.windDirection10m, location)) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_DIRECTION_BAD);
  }

  // Upper atmosphere wind conditions
  if (dp.windSpeed925hPa > alert_rule.MAX_WIND_SPEED_925hPa) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_925_HIGH);
  }
  if (dp.windSpeed850hPa > alert_rule.MAX_WIND_SPEED_850hPa) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_850_HIGH);
  }
  if (dp.windSpeed700hPa > alert_rule.MAX_WIND_SPEED_700hPa) {
    failures.push(FAILURE_DESCRIPTIONS.WIND_SPEED_700_HIGH);
  }

  // Wind shear warnings (not failures)
  if (!isWindShearAcceptable(dp.windDirection10m, dp.windDirection925hPa)) {
    warnings.push(WARNING_DESCRIPTIONS.WIND_SHEAR_925);
  }
  if (!isWindShearAcceptable(dp.windDirection10m, dp.windDirection850hPa)) {
    warnings.push(WARNING_DESCRIPTIONS.WIND_SHEAR_850);
  }
  if (!isWindShearAcceptable(dp.windDirection10m, dp.windDirection700hPa)) {
    warnings.push(WARNING_DESCRIPTIONS.WIND_SHEAR_700);
  }

  // Thermal and stability conditions
  if (alert_rule.MAX_CAPE > 0 && dp.cape >= alert_rule.MAX_CAPE) {
    failures.push(FAILURE_DESCRIPTIONS.CAPE_HIGH);
  }
  if (dp.liftedIndex < alert_rule.MIN_LIFTED_INDEX) {
    failures.push(FAILURE_DESCRIPTIONS.LIFTED_INDEX_LOW);
  }
  if (dp.liftedIndex > alert_rule.MAX_LIFTED_INDEX) {
    failures.push(FAILURE_DESCRIPTIONS.LIFTED_INDEX_HIGH);
  }
  if (dp.convectiveInhibition <= alert_rule.MIN_CONVECTIVE_INHIBITION) {
    failures.push(FAILURE_DESCRIPTIONS.CONVECTIVE_INHIBITION_LOW);
  }

  // Visual and precipitation conditions
  const ACCEPTABLE_WEATHER_CODES = [
    'clearsky_day',
    'fair_day',
    'partlycloudy_day',
    'cloudy',
  ];

  if (dp.precipitation > alert_rule.MAX_PRECIPITATION) {
    failures.push(FAILURE_DESCRIPTIONS.PRECIPITATION_HIGH);
  }
  if (dp.cloudCover >= alert_rule.MAX_CLOUD_COVER) {
    failures.push(FAILURE_DESCRIPTIONS.CLOUD_COVER_HIGH);
  }
  if (!ACCEPTABLE_WEATHER_CODES.includes(dp.weatherCode)) {
    failures.push(FAILURE_DESCRIPTIONS.WEATHER_CODE_BAD);
  }

  return {
    isGood: failures.length === 0,
    failures,
    warnings,
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
    description:
      'Wind direction at 925hPa differs significantly from ground level',
  },
  WIND_SHEAR_850: {
    code: 'WIND_SHEAR_850',
    description:
      'Wind direction at 850hPa differs significantly from ground level',
  },
  WIND_SHEAR_700: {
    code: 'WIND_SHEAR_700',
    description:
      'Wind direction at 700hPa differs significantly from ground level',
  },
} as const;
