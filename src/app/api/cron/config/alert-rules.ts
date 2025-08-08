import { AlertRule } from '../types';

const DEFAULT_VALUES = {
    MIN_WIND_SPEED: 0,
    MAX_WIND_SPEED: 8,
    MAX_GUST: 10.0,
    MAX_GUST_DIFFERENCE: 4.0,
    MAX_PRECIPITATION: 0,
    MAX_CAPE: 10000,
    MIN_LIFTED_INDEX: -6,
    MAX_LIFTED_INDEX: 8,
    MIN_CONVECTIVE_INHIBITION: -5000,
    MAX_CLOUD_COVER: 100,
    MAX_WIND_SPEED_925hPa: 15, // 925hPa is approximately 800m altitude
    MAX_WIND_SPEED_850hPa: 20, // 850hPa is approximately 1500m altitude
    MAX_WIND_SPEED_700hPa: 25, // 700hPa is approximately 3000m altitude
    WMO_CODE_MAX: 4, // 0 = Clear, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
};

export const ALERT_RULES: AlertRule[] = [
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Keiservarden, Bodø",
        locationName: "Keiservarden, Bodø",
        lat: 67.315278,
        long: 14.478333,
        WIND_DIRECTIONS: ['N', 'NW', 'W'],
    },
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Hoven, Gimsøya",
        locationName: "Hoven, Gimsøya",
        lat: 68.332778,
        long: 14.110278,
        WIND_DIRECTIONS: ['NW', 'N', 'NE', 'E', 'SE', 'S', 'SW'],
    },
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Liaset, Voss",
        locationName: "Liaset, Voss",
        lat: 60.703333,
        long: 6.521389,
        WIND_DIRECTIONS: ['NW', 'N', 'SW', 'W'],
    },
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Hangur, sør-start, Voss",
        locationName: "Hangur, sør-start, Voss",
        lat: 60.638889,
        long: 6.403056,
        WIND_DIRECTIONS: ['SW', 'S', 'SE'],
    },
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Salknappen (Riksanlegget), Vågå",
        locationName: "Salknappen (Riksanlegget), Vågå",
        lat: 61.900278,
        long: 9.245278,
        WIND_DIRECTIONS: ['SW', 'S', 'SE'],
    },
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Grøtterud, Hvittingfoss",
        locationName: "Grøtterud , Hvittingfoss",
        lat: 59.504722,
        long: 9.998056,
        WIND_DIRECTIONS: ['SW', 'S', 'SE'],
    },
    {
        ...DEFAULT_VALUES,
        alert_name: "Alert for Sundvollen, Viken",
        locationName: "Sundvollen, Viken",
        lat: 60.053889,
        long: 10.322500,
        WIND_DIRECTIONS: ['NW', 'W', 'N'],
    },
];
