import { DEFAULT_GLIDE_CONDITIONS } from '@/lib/glideMeasurement/calculations';
import { getGlideMeasurementConditions, setGlideMeasurementConditions } from './glideMeasurementStorage';

const STORAGE_KEY = 'windlord_glide_measurement_settings';
const DAY_MS = 24 * 60 * 60 * 1_000;

describe('glide measurement local storage', () => {
  let nowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    localStorage.clear();
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('persists non-default wind conditions with the glide settings', () => {
    setGlideMeasurementConditions({
      glideThresholds: [7, 9, 12],
      airspeedMps: 11.5,
      wind: { directionDegrees: 225, speedMps: 6 },
    });

    expect(getGlideMeasurementConditions()).toEqual({
      glideThresholds: [7, 9, 12],
      airspeedMps: 11.5,
      wind: { directionDegrees: 225, speedMps: 6 },
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
      windConditions: {
        directionDegrees: 225,
        speedMps: 6,
        savedAt: 1_000,
      },
    });
  });

  it('expires only the wind conditions after 24 hours', () => {
    setGlideMeasurementConditions({
      glideThresholds: [7, 9, 12],
      airspeedMps: 11.5,
      wind: { directionDegrees: 225, speedMps: 6 },
    });
    nowSpy.mockReturnValue(1_000 + DAY_MS + 1);

    expect(getGlideMeasurementConditions()).toEqual({
      glideThresholds: [7, 9, 12],
      airspeedMps: 11.5,
      wind: DEFAULT_GLIDE_CONDITIONS.wind,
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').windConditions).toBeUndefined();
  });

  it('does not persist wind direction when the selected speed is calm', () => {
    setGlideMeasurementConditions({
      glideThresholds: [6, 8, 10],
      airspeedMps: 10,
      wind: { directionDegrees: 180, speedMps: 0 },
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').windConditions).toBeUndefined();
    expect(getGlideMeasurementConditions().wind).toEqual(DEFAULT_GLIDE_CONDITIONS.wind);
  });
});
