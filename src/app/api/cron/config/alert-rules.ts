import { AlertRule } from '../types';

export const ALERT_RULES: AlertRule[] = [
    {
        alert_name: "Alert for Keiservarden, Bodø",
        locationName: "Keiservarden, Bodø",
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
        WIND_DIRECTIONS: ['N', 'NW', 'W'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
    {
        alert_name: "Alert for Hoven, Gimsøya",
        locationName: "Hoven, Gimsøya",
        lat: 68.332778,
        long: 14.110278,
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
        WIND_DIRECTIONS: ['NW', 'N', 'NE', 'E', 'SE', 'S', 'SW'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
    {
        alert_name: "Alert for Liaset, Voss",
        locationName: "Liaset, Voss",
        lat: 60.703333,
        long: 6.521389,
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
        WIND_DIRECTIONS: ['NW', 'N', 'SW', 'W'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
    {
        alert_name: "Alert for Hangur, sør-start, Voss",
        locationName: "Hangur, sør-start, Voss",
        lat: 60.638889,
        long: 6.403056,
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
        WIND_DIRECTIONS: ['SW', 'S', 'SE'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
    {
        alert_name: "Alert for Salknappen (Riksanlegget), Vågå",
        locationName: "Salknappen (Riksanlegget), Vågå",
        lat: 61.900278,
        long: 9.245278,
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
        WIND_DIRECTIONS: ['SW', 'S', 'SE'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
    {
        alert_name: "Alert for Grøtterud , Hvittingfoss",
        locationName: "Grøtterud , Hvittingfoss",
        lat: 59.504722,
        long: 9.998056,
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
        WIND_DIRECTIONS: ['SW', 'S', 'SE'],
        WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
    },
];
