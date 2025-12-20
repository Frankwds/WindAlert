import { MinimalForecast } from '@/lib/supabase/types';
import { DEFAULT_ALERT_RULE } from '@/app/api/cron/_lib/validate/alert-rules';

/**
 * Checks if wind direction is good for the location
 * Reused from validateDataPoint.ts
 */
function isWindDirectionGood(windDirection: number, locationDirections: string[]): boolean {
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
    if (locationDirections.includes(dir.key)) {
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
 * Validates if weather conditions are suitable for paragliding based on MinimalForecast fields
 * This is a simplified version that only uses fields available in MinimalForecast
 *
 * @param forecast - The forecast data point to validate
 * @param locationWindDirections - Array of wind direction symbols (e.g., ['n', 'e', 's'])
 * @returns true if all validations pass, false otherwise
 */
export function isForecastPromising(forecast: MinimalForecast, locationWindDirections: string[]): boolean {
  // Check if it's night time
  if (forecast.is_day === 0) {
    return false;
  }

  // If no wind direction added, no validation.
  if (locationWindDirections.length == 0) {
    return false;
  }

  // Check weather code - only allow good weather conditions
  const good_weather = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];
  if (!good_weather.includes(forecast.weather_code)) {
    return false;
  }

  // Check wind speed
  const isLowWind = forecast.wind_speed < DEFAULT_ALERT_RULE.MIN_WIND_SPEED;
  const isMaxWind = forecast.wind_speed > DEFAULT_ALERT_RULE.MAX_WIND_SPEED;

  if (isLowWind || isMaxWind) {
    return false;
  }

  // Check wind gusts
  if (forecast.wind_gusts !== undefined) {
    const isMaxGust = forecast.wind_gusts > DEFAULT_ALERT_RULE.MAX_GUST;
    if (isMaxGust && !isMaxWind) {
      return false;
    }

    // Check for much wind + much gust combination
    const isMuchWind = forecast.wind_speed >= DEFAULT_ALERT_RULE.MUCH_WIND;
    const isMuchGust = forecast.wind_gusts >= DEFAULT_ALERT_RULE.MUCH_GUST;
    if (isMuchWind && isMuchGust && !isMaxGust && !isMaxWind) {
      return false;
    }
  }

  // Check wind direction
  const isWrongWindDirection = !isWindDirectionGood(forecast.wind_direction, locationWindDirections);
  if (isWrongWindDirection) {
    return false;
  }

  // All checks passed
  return true;
}
