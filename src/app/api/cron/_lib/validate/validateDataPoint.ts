import { AlertRule } from '@/lib/common/types/alertRule';
import { ForecastCache1hr } from '@/lib/supabase/types';

function isWindDirectionGood(windDirection: number, location: string[]): boolean {
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
 * If wind speed at altitude is less than 4 m/s, any wind shear is acceptable
 */
function isWindShearAcceptable(groundDirection: number, altitudeDirection: number, altitudeWindSpeed: number): boolean {
  // If wind speed at altitude is less than 4 m/s, any wind shear is acceptable
  if (altitudeWindSpeed < 4) {
    return true;
  }
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
  const good_weather = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];
  const isBadWeather = !good_weather.includes(dp.weather_code);

  const isLowWind = dp.wind_speed < alert_rule.MIN_WIND_SPEED;
  const isMaxWind = dp.wind_speed > alert_rule.MAX_WIND_SPEED;
  const isMaxGust = dp.wind_gusts !== undefined && dp.wind_gusts > alert_rule.MAX_GUST;
  const isWrongWindDirection = !isWindDirectionGood(dp.wind_direction, location);

  const isMuchWind = dp.wind_speed >= alert_rule.MUCH_WIND;
  const isMuchGust = dp.wind_gusts !== undefined && dp.wind_gusts >= alert_rule.MUCH_GUST;

  const isTooWindy800m = dp.wind_speed_925hpa > alert_rule.MAX_WIND_SPEED_925hPa;
  const isTooWindy1500m = dp.wind_speed_850hpa > alert_rule.MAX_WIND_SPEED_850hPa;
  const isTooWindy3000m = dp.wind_speed_700hpa > alert_rule.MAX_WIND_SPEED_700hPa;

  const isWindShear800m = !isWindShearAcceptable(dp.wind_direction, dp.wind_direction_925hpa, dp.wind_speed_925hpa);
  const isWindShear1500m = !isWindShearAcceptable(dp.wind_direction, dp.wind_direction_850hpa, dp.wind_speed_850hpa);
  const isWindShear3000m = !isWindShearAcceptable(dp.wind_direction, dp.wind_direction_700hpa, dp.wind_speed_700hpa);

  const isMaybeRain =
    dp.precipitation_max !== undefined &&
    dp.precipitation_min !== undefined &&
    dp.precipitation_max > alert_rule.MAX_PRECIPITATION &&
    dp.precipitation_min <= alert_rule.MAX_PRECIPITATION;
  const isRain = dp.precipitation_min !== undefined && dp.precipitation_min > alert_rule.MAX_PRECIPITATION;

  // Weather symbol
  if (isBadWeather && dp.is_day) {
    failures.push(fail_reasons.bad_weather);
  }
  // Surface wind conditions
  if (isLowWind) {
    failures.push(fail_reasons.wind_low);
  }
  if (isMaxWind) {
    failures.push(fail_reasons.wind_high);
  }
  if (isMaxGust && !isMaxWind) {
    failures.push(fail_reasons.gust_high);
  }

  if (isMuchWind && isMuchGust && !isMaxGust && !isMaxWind) {
    failures.push(fail_reasons.much_wind);
  }

  if (isWrongWindDirection) {
    failures.push(fail_reasons.direction_wrong);
  }

  // Precipitation
  if (isRain) {
    failures.push(fail_reasons.rain);
  }
  if (!isRain && isMaybeRain) {
    warnings.push(warn_reasons.rain);
  }

  // Upper atmosphere wind conditions
  if (isTooWindy800m) {
    warnings.push(warn_reasons.WIND_SPEED_925_HIGH(dp.geopotential_height_925hpa));
  }
  if (!isTooWindy800m && isTooWindy1500m) {
    warnings.push(warn_reasons.WIND_SPEED_850_HIGH(dp.geopotential_height_850hpa));
  }
  if (!isTooWindy800m && !isTooWindy1500m && isTooWindy3000m) {
    warnings.push(warn_reasons.WIND_SPEED_700_HIGH(dp.geopotential_height_700hpa));
  }

  // Wind shear warnings (not failures)
  if (isWindShear800m) {
    warnings.push(warn_reasons.WIND_SHEAR_925(dp.geopotential_height_925hpa));
  }
  if (!isWindShear800m && isWindShear1500m) {
    warnings.push(warn_reasons.WIND_SHEAR_850(dp.geopotential_height_850hpa));
  }
  if (!isWindShear800m && !isWindShear1500m && isWindShear3000m) {
    warnings.push(warn_reasons.WIND_SHEAR_700(dp.geopotential_height_700hpa));
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

  much_wind: 'Det blåser for mye.',

  direction_wrong: 'Vindretningen er feil.',

  altitude_wind: 'Det er for mye høydevind.',

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
  rain: 'Det kan komme regn',
} as const;
