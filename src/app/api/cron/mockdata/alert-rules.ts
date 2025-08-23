import { AlertRule } from '@/lib/common/types/alertRule';

const DEFAULT_VALUES = {
  MIN_WIND_SPEED: 0,
  MAX_WIND_SPEED: 8,
  MAX_GUST: 10.0,
  MAX_GUST_DIFFERENCE: 5.0,
  MAX_PRECIPITATION: 0,
  MAX_CAPE: 10000,
  MIN_LIFTED_INDEX: -6,
  MAX_LIFTED_INDEX: 8,
  MIN_CONVECTIVE_INHIBITION: -5000,
  MAX_CLOUD_COVER: 100,
  MAX_WIND_SPEED_925hPa: 15, // 925hPa is approximately 800m altitude
  MAX_WIND_SPEED_850hPa: 20, // 850hPa is approximately 1500m altitude
  MAX_WIND_SPEED_700hPa: 25, // 700hPa is approximately 3000m altitude
};

const GUST_AGNOSTIC_VALUES = {
  ...DEFAULT_VALUES,
  MAX_GUST: 0,
  MAX_GUST_DIFFERENCE: 0,
};

const ALERT_RULES_NORMAL: AlertRule[] = [
  {
    id: 1,
    locationId: 1,
    ...DEFAULT_VALUES,
    alert_name: 'Normal Rule',
  },
  {
    id: 2,
    locationId: 2,
    ...DEFAULT_VALUES,
    alert_name: 'Normal Rule',
  },
  {
    id: 3,
    locationId: 3,
    ...DEFAULT_VALUES,
    alert_name: 'Normal Rule',
  },
  {
    id: 4,
    locationId: 4,
    ...DEFAULT_VALUES,
    alert_name: 'Normal Rule',
  },
  {
    id: 5,
    locationId: 5,
    ...DEFAULT_VALUES,
    alert_name: 'Normal Rule',
  },
  {
    id: 6,
    locationId: 6,
    ...DEFAULT_VALUES,
    alert_name: 'Normal Rule',
  },
];

const ALERT_RULES_GUST_AGNOSTIC: AlertRule[] = [
  {
    id: 11,
    locationId: 1,
    ...GUST_AGNOSTIC_VALUES,
    alert_name: 'Gust Agnostic Rule',
  },
  {
    id: 22,
    locationId: 2,
    ...GUST_AGNOSTIC_VALUES,
    alert_name: 'Gust Agnostic Rule',
  },
  {
    id: 33,
    locationId: 3,
    ...GUST_AGNOSTIC_VALUES,
    alert_name: 'Gust Agnostic Rule',
  },
  {
    id: 44,
    locationId: 4,
    ...GUST_AGNOSTIC_VALUES,
    alert_name: 'Gust Agnostic Rule',
  },
  {
    id: 55,
    locationId: 5,
    ...GUST_AGNOSTIC_VALUES,
    alert_name: 'Gust Agnostic Rule',
  },
  {
    id: 66,
    locationId: 6,
    ...GUST_AGNOSTIC_VALUES,
    alert_name: 'Gust Agnostic Rule',
  },
];
export const ALERT_RULES: AlertRule[] = [...ALERT_RULES_NORMAL, ...ALERT_RULES_GUST_AGNOSTIC];
