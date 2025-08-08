import { AlertRule } from '../types';

export const ALERT_RULES: AlertRule[] = [
    {
        alert_name: "Alert for Bodø", locationName: "Bodø", lat: 67.31493, long: 14.47845,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        THUNDERSTORM_CODES: [95, 96, 99], MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW']
    },
    {
        alert_name: "Alert for Hvittingfoss", locationName: "Hvittingfoss", lat: 59.512724, long: 10.024911,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        THUNDERSTORM_CODES: [95, 96, 99], MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW']
    },
    {
        alert_name: "Alert for Nidwalden", locationName: "Nidwalden", lat: 46.938416, long: 8.341309,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        THUNDERSTORM_CODES: [95, 96, 99], MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW']
    },
    {
        alert_name: "Alert for Bois de Luan", locationName: "Bois de Luan", lat: 46.383855, long: 6.965955,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        THUNDERSTORM_CODES: [95, 96, 99], MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW']
    },
    {
        alert_name: "Mock Alert", locationName: "Mock Location", lat: 0, long: 0,
        MIN_WIND_SPEED: 2, MAX_WIND_SPEED: 6, MAX_GUST: 8.0, MAX_PRECIPITATION: 0,
        THUNDERSTORM_CODES: [95, 96, 99], MAX_CAPE: 1000, MIN_LIFTED_INDEX: -4, MAX_LIFTED_INDEX: 2,
        MIN_CONVECTIVE_INHIBITION: -50, MAX_CLOUD_COVER: 70, MAX_WIND_SPEED_925hPa: 10,
        MAX_WIND_SPEED_850hPa: 15, MAX_WIND_SPEED_700hPa: 20, WIND_DIRECTIONS: ['N', 'NE', 'SE', 'NW']
    },
];
