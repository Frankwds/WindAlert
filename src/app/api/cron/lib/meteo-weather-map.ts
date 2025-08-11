export const METEO_WEATHER_MAP: { [key: number]: number } = {
  0: 1,   // Clear sky -> Clear sky
  1: 2,   // Mainly clear -> Fair
  2: 3,   // Partly cloudy -> Partly cloudy
  3: 4,   // Overcast -> Cloudy
  45: 15,  // Fog -> Fog
  48: 15,  // Depositing rime fog -> Fog
  51: 46,  // Light Drizzle -> Light rain
  53: 9,   // Moderate Drizzle -> Rain
  55: 10,  // Dense Drizzle -> Heavy rain
  56: 47,  // Light Freezing Drizzle -> Light sleet
  57: 12,  // Dense Freezing Drizzle -> Sleet
  61: 46,  // Slight Rain -> Light rain
  63: 9,   // Moderate Rain -> Rain
  65: 10,  // Heavy Rain -> Heavy rain
  66: 47,  // Light Freezing Rain -> Light sleet
  67: 12,  // Heavy Freezing Rain -> Sleet
  71: 49,  // Slight Snow fall -> Light snow
  73: 13,  // Moderate Snow fall -> Snow
  75: 50,  // Heavy Snow fall -> Heavy snow
  77: 13,  // Snow grains -> Snow
  80: 40,  // Slight Rain showers -> Light rain showers
  81: 5,   // Moderate Rain showers -> Rain showers
  82: 41,  // Violent Rain showers -> Heavy rain showers
  85: 44,  // Slight Snow showers -> Light snow showers
  86: 45,  // Heavy Snow showers -> Heavy snow showers
  95: 22,  // Thunderstorm: Slight or moderate -> Rain and thunder
  96: 22,  // Thunderstorm with slight hail -> Rain and thunder
  99: 22,  // Thunderstorm with heavy hail -> Rain and thunder
};

export function getMeteoWeatherCode(wmoCode: number): number {
  return METEO_WEATHER_MAP[wmoCode] || 0; // Default to 0 or a suitable fallback if code not found
}
