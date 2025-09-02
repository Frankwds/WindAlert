import { AlertRule } from '@/lib/common/types/alertRule';
import { ForecastCache1hr } from '@/lib/supabase/types';

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
  dp: ForecastCache1hr,
  alert_rule: AlertRule,
  location: string[]
): { isGood: boolean; validation_failures: string; validation_warnings: string } {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (dp.is_day === 0) {
    failures.push(fail_reasons.night);
  }

  // Visual and precipitation conditions
  const good_weather = [
    'clearsky_day',
    'fair_day',
    'partlycloudy_day',
    'cloudy',
  ];
  if (!good_weather.includes(dp.weather_code)) {
    failures.push(fail_reasons.bad_weather);
  }
  // Surface wind conditions
  if (dp.wind_speed < alert_rule.MIN_WIND_SPEED) {
    failures.push(fail_reasons.wind_low);
  }
  if (dp.wind_speed > alert_rule.MAX_WIND_SPEED) {
    failures.push(fail_reasons.wind_high);
  }
  if (alert_rule.MAX_GUST > 0 && dp.wind_gusts > alert_rule.MAX_GUST) {
    failures.push(fail_reasons.gust_high);
  }
  if (
    alert_rule.MAX_GUST_DIFFERENCE > 0 &&
    Math.abs(dp.wind_speed - dp.wind_gusts) >
    alert_rule.MAX_GUST_DIFFERENCE
  ) {
    failures.push(fail_reasons.gust_difference);
  }
  if (!isWindDirectionGood(dp.wind_direction, location)) {
    failures.push(fail_reasons.direction_wrong);
  }

  // Upper atmosphere wind conditions
  if (dp.wind_speed_925hpa > alert_rule.MAX_WIND_SPEED_925hPa) {
    warnings.push(warn_reasons.WIND_SPEED_925_HIGH(dp.geopotential_height_925hpa));
  }
  if (dp.wind_speed_850hpa > alert_rule.MAX_WIND_SPEED_850hPa) {
    warnings.push(warn_reasons.WIND_SPEED_850_HIGH(dp.geopotential_height_850hpa));
  }
  if (dp.wind_speed_700hpa > alert_rule.MAX_WIND_SPEED_700hPa) {
    warnings.push(warn_reasons.WIND_SPEED_700_HIGH(dp.geopotential_height_700hpa));
  }

  // Wind shear warnings (not failures)
  if (!isWindShearAcceptable(dp.wind_direction, dp.wind_direction_925hpa)) {
    warnings.push(warn_reasons.WIND_SHEAR_925(dp.geopotential_height_925hpa));
  }
  if (!isWindShearAcceptable(dp.wind_direction, dp.wind_direction_850hpa)) {
    warnings.push(warn_reasons.WIND_SHEAR_850(dp.geopotential_height_850hpa));
  }
  if (!isWindShearAcceptable(dp.wind_direction, dp.wind_direction_700hpa)) {
    warnings.push(warn_reasons.WIND_SHEAR_700(dp.geopotential_height_700hpa));
  }

  // Thermal and stability conditions
  if (alert_rule.MAX_CAPE > 0 && dp.cape >= alert_rule.MAX_CAPE) {
    failures.push(fail_reasons.cape_high);
  }
  if (dp.lifted_index < alert_rule.MIN_LIFTED_INDEX) {
    failures.push(fail_reasons.lifted_idex_low);
  }
  if (dp.lifted_index > alert_rule.MAX_LIFTED_INDEX) {
    failures.push(fail_reasons.lifted_index_high);
  }
  if (dp.convective_inhibition <= alert_rule.MIN_CONVECTIVE_INHIBITION) {
    failures.push(fail_reasons.convective_inhibition_low);
  }


  if (dp.precipitation > alert_rule.MAX_PRECIPITATION) {
    failures.push(fail_reasons.rain);
  }



  return {
    isGood: failures.length === 0,
    validation_failures: failures.join(','),
    validation_warnings: warnings.join(','),
  };
}

// Failure descriptions for each type of condition that can fail
const fail_reasons = {
  wind_low: 'Det er for lite vind.',
  wind_high: 'Det er for mye vind.',
  gust_high: 'Det er for mye i kastene.',
  gust_difference: 'For stor forskjell mellom vind og kast.',
  direction_wrong: 'Vindretningen er feil.',

  night: 'Det er mørkt.',
  rain: 'Det regner.',
  bad_weather: 'Det er dårlig vær.',

  cape_high: 'CAPE er for høy.',
  lifted_idex_low: 'Lifted Index er for lav.',
  lifted_index_high: 'Lifted Index er for høy.',
  convective_inhibition_low: 'Konvektiv inhibisjon ligger for lavt.',
} as const;

// Warning descriptions for conditions that should be noted but don't cause failure
const warn_reasons = {
  WIND_SHEAR_925: (height: number) => `Endring i vindretning (${height}m)`,
  WIND_SHEAR_850: (height: number) => `Endring i vindretning (${height}m)`,
  WIND_SHEAR_700: (height: number) => `Endring i vindretning (${height}m)`,
  WIND_SPEED_925_HIGH: (height: number) => `Mye høydevind (${height}m)`,
  WIND_SPEED_850_HIGH: (height: number) => `Mye høydevind (${height}m)`,
  WIND_SPEED_700_HIGH: (height: number) => `Mye høydevind (${height}m)`,
} as const;
