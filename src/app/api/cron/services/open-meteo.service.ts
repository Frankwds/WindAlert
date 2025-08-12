import { fetchMeteoData } from '@/app/lib/api';
import { OpenMeteoResponse } from '../types/';
import { WeatherDataPoint } from '../types';
import { mapWMOToYrWeatherCode } from '@/app/api/lib/mapWeatherCode';

export async function fetchWeatherData(latitude: number, longitude: number): Promise<any> {
    return fetchMeteoData(latitude, longitude);
}

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
