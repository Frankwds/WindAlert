/**
 * Get wind speed color based on wind speed in knots
 * Uses CSS variables from globals.css for consistent theming
 */
export function getWindSpeedColor(windSpeed: number): string {
  const roundedSpeed = windSpeed;

  // Determine wind speed color based on knots
  if (roundedSpeed === 0) {
    return 'var(--wind-none)'; // 0 knots - light gray
  } else if (roundedSpeed > 0 && roundedSpeed < 4) {
    return 'var(--wind-calm)'; // < 4 knots - light green
  } else if (roundedSpeed >= 4 && roundedSpeed <= 6) {
    return 'var(--wind-light)'; // 4-5 knots - bright green
  } else if (roundedSpeed > 6 && roundedSpeed <= 9) {
    return 'var(--wind-moderate)'; // 6-9 knots - orange
  } else {
    return 'var(--wind-strong)'; // > 9 knots - red
  }
}

/**
 * Get temperature opacity based on temperature in degrees
 * Each degree gives 0.03 opacity (minimum 0.1, maximum 1.0)
 */
export function getTemperatureOpacity(temperature: number): number {
  const baseOpacity = 0.1; // Minimum opacity
  const opacityPerDegree = 0.03;
  const calculatedOpacity = baseOpacity + Math.abs(temperature) * opacityPerDegree;

  return Math.min(calculatedOpacity, 1.0);
}
