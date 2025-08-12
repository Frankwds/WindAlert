export const METEO_CODE_TO_YR_MAP: { [key: number]: (isDay: 0 | 1) => string } =
  {
    0: (isDay) => (isDay ? "clearsky_day" : "clearsky_night"), // Clear sky
    1: (isDay) => (isDay ? "fair_day" : "fair_night"), // Mainly clear
    2: (isDay) => (isDay ? "partlycloudy_day" : "partlycloudy_night"), // Partly cloudy
    3: () => "cloudy", // Overcast
    45: () => "fog", // Fog
    48: () => "fog", // Depositing rime fog
    51: () => "lightrain", // Light Drizzle
    53: () => "rain", // Moderate Drizzle
    55: () => "heavyrain", // Dense Drizzle
    56: () => "lightsleet", // Light Freezing Drizzle
    57: () => "sleet", // Dense Freezing Drizzle
    61: () => "lightrain", // Slight Rain
    63: () => "rain", // Moderate Rain
    65: () => "heavyrain", // Heavy Rain
    66: () => "lightsleet", // Light Freezing Rain
    67: () => "sleet", // Heavy Freezing Rain
    71: () => "lightsnow", // Slight Snow fall
    73: () => "snow", // Moderate Snow fall
    75: () => "heavysnow", // Heavy Snow fall
    77: () => "snow", // Snow grains
    80: (isDay) => (isDay ? "lightrainshowers_day" : "lightrainshowers_night"), // Slight Rain showers
    81: (isDay) => (isDay ? "rainshowers_day" : "rainshowers_night"), // Moderate Rain showers
    82: (isDay) => (isDay ? "heavyrainshowers_day" : "heavyrainshowers_night"), // Violent Rain showers
    85: (isDay) => (isDay ? "lightsnowshowers_day" : "lightsnowshowers_night"), // Slight Snow showers
    86: (isDay) => (isDay ? "heavysnowshowers_day" : "heavysnowshowers_night"), // Heavy Snow showers
    95: (isDay) =>
      isDay
        ? "lightrainshowersandthunder_day"
        : "lightrainshowersandthunder_night", // Thunderstorm: Slight or moderate
    96: (isDay) =>
      isDay ? "sleetshowersandthunder_day" : "sleetshowersandthunder_night", // Thunderstorm with slight hail
    99: (isDay) =>
      isDay
        ? "heavysleetshowersandthunder_day"
        : "heavysleetshowersandthunder_night", // Thunderstorm with heavy hail
  };

export function mapWMOToYrWeatherCode(wmoCode: number, isDay: 0 | 1): string {
  const weatherFunc = METEO_CODE_TO_YR_MAP[wmoCode];
  if (weatherFunc) {
    return weatherFunc(isDay);
  }
  return "unknown"; // Default to "unknown" or a suitable fallback if code not found
}
