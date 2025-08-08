import { AlertRule } from '../types';

export const ALERT_RULES: AlertRule[] = [
    {
        alert_name: "Alert for Keiservarden",
        locationName: "Keiservarden",
        lat: 67.315278,
        long: 14.478333,
        MIN_WIND_SPEED: 0,
        MAX_WIND_SPEED: 8,
        MAX_GUST: 10.0,
        MAX_PRECIPITATION: 0,
        MAX_CAPE: 10000,
        MIN_LIFTED_INDEX: -6,
        MAX_LIFTED_INDEX: 8,
        MIN_CONVECTIVE_INHIBITION: -5000,
        MAX_CLOUD_COVER: 100,
        MAX_WIND_SPEED_925hPa: 15, // 925hPa is approximately 800m altitude
        MAX_WIND_SPEED_850hPa: 20, // 850hPa is approximately 1500m altitude
        MAX_WIND_SPEED_700hPa: 25, // 700hPa is approximately 3000m altitude
        WIND_DIRECTIONS: ['N', 'NE', 'NW', 'W'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
    {
        alert_name: "Alert for Hvittingfoss", locationName: "Hvittingfoss", lat: 59.512724, long: 10.024911,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW'],
        WMO_CODE_MAX: 4,
    },
    {
        alert_name: "Alert for Nidwalden", locationName: "Nidwalden", lat: 46.938416, long: 8.341309,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW'],
        WMO_CODE_MAX: 4,
    },
    {
        alert_name: "Alert for Bois de Luan", locationName: "Bois de Luan", lat: 46.383855, long: 6.965955,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW'],
        WMO_CODE_MAX: 4,
    },
];
