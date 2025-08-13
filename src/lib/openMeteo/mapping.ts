import { OpenMeteoResponse } from './types';
import { WeatherDataPoint } from './types';


export function mapOpenMeteoData(validatedData: OpenMeteoResponse): WeatherDataPoint[] {

    const hourlyData = validatedData.hourly;
    const timePoints = hourlyData.time.length;
    const transformedData: WeatherDataPoint[] = [];

    for (let i = 0; i < timePoints; i++) {
        const dataPoint: WeatherDataPoint = {
            time: hourlyData.time[i],
            windSpeed1000hPa: hourlyData.wind_speed_1000hPa[i],
            windDirection1000hPa: hourlyData.wind_direction_1000hPa[i],
            windDirection925hPa: hourlyData.wind_direction_925hPa[i],
            windSpeed925hPa: hourlyData.wind_speed_925hPa[i],
            windSpeed850hPa: hourlyData.wind_speed_850hPa[i],
            windDirection850hPa: hourlyData.wind_direction_850hPa[i],
            windDirection700hPa: hourlyData.wind_direction_700hPa[i],
            windSpeed700hPa: hourlyData.wind_speed_700hPa[i],
            temperature1000hPa: hourlyData.temperature_1000hPa[i],
            temperature925hPa: hourlyData.temperature_925hPa[i],
            temperature850hPa: hourlyData.temperature_850hPa[i],
            temperature700hPa: hourlyData.temperature_700hPa[i],
            temperature2m: hourlyData.temperature_2m[i],
            precipitation: hourlyData.precipitation[i],
            precipitationProbability: hourlyData.precipitation_probability[i],
            cloudCover: hourlyData.cloud_cover[i],
            windSpeed10m: hourlyData.wind_speed_10m[i],
            windDirection10m: hourlyData.wind_direction_10m[i],
            windGusts10m: hourlyData.wind_gusts_10m[i],
            weatherCode: mapWMOToYrWeatherCode(hourlyData.weather_code[i], hourlyData.is_day[i]), // Apply mapping here
            pressureMsl: hourlyData.pressure_msl[i],
            convectiveInhibition: hourlyData.convective_inhibition[i],
            cloudCoverLow: hourlyData.cloud_cover_low[i],
            cloudCoverMid: hourlyData.cloud_cover_mid[i],
            cloudCoverHigh: hourlyData.cloud_cover_high[i],
            isDay: hourlyData.is_day[i],
            freezingLevelHeight: hourlyData.freezing_level_height[i],
            cape: hourlyData.cape[i],
            liftedIndex: hourlyData.lifted_index[i],
            boundaryLayerHeight: hourlyData.boundary_layer_height[i],
            geopotentialHeight1000hPa: hourlyData.geopotential_height_1000hPa[i],
            geopotentialHeight925hPa: hourlyData.geopotential_height_925hPa[i],
            geopotentialHeight850hPa: hourlyData.geopotential_height_850hPa[i],
            geopotentialHeight700hPa: hourlyData.geopotential_height_700hPa[i],
        };
        transformedData.push(dataPoint);
    }
    return transformedData;
}

export function mapWMOToYrWeatherCode(wmoCode: number, isDay: 0 | 1): string {
    const weatherFunc = METEO_CODE_TO_YR_MAP[wmoCode];
    if (weatherFunc) {
        return weatherFunc(isDay);
    }
    return "unknown"; // Default to "unknown" or a suitable fallback if code not found
}

const METEO_CODE_TO_YR_MAP: { [key: number]: (isDay: 0 | 1) => string } = {
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

