import { z } from 'zod';
import {
  AIRSPEED_MAX_MPS,
  AIRSPEED_MIN_MPS,
  DEFAULT_GLIDE_CONDITIONS,
  GLIDE_THRESHOLD_MAX,
  GLIDE_THRESHOLD_MIN,
  normalizeGlideConditions,
  WIND_SPEED_MAX_MPS,
  type GlideConditions,
  type GlideThresholds,
} from '@/lib/glideMeasurement/calculations';

const GLIDE_MEASUREMENT_SETTINGS_KEY = 'windlord_glide_measurement_settings';
const WIND_CONDITIONS_TTL_MS = 24 * 60 * 60 * 1_000;

const StoredGlideMeasurementSettingsSchema = z.object({
  glideThresholds: z.tuple([
    z.number().min(GLIDE_THRESHOLD_MIN).max(GLIDE_THRESHOLD_MAX),
    z.number().min(GLIDE_THRESHOLD_MIN).max(GLIDE_THRESHOLD_MAX),
    z.number().min(GLIDE_THRESHOLD_MIN).max(GLIDE_THRESHOLD_MAX),
  ]),
  airspeedMps: z.number().min(AIRSPEED_MIN_MPS).max(AIRSPEED_MAX_MPS),
  windConditions: z
    .object({
      directionDegrees: z.number().min(0).lt(360),
      speedMps: z.number().positive().max(WIND_SPEED_MAX_MPS),
      savedAt: z.number().positive(),
    })
    .optional(),
});

type StoredGlideMeasurementSettings = z.infer<typeof StoredGlideMeasurementSettingsSchema>;

const getDefaultConditions = (): GlideConditions => ({
  glideThresholds: [...DEFAULT_GLIDE_CONDITIONS.glideThresholds] as GlideThresholds,
  airspeedMps: DEFAULT_GLIDE_CONDITIONS.airspeedMps,
  wind: { ...DEFAULT_GLIDE_CONDITIONS.wind },
});

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const writeStoredSettings = (settings: StoredGlideMeasurementSettings) => {
  try {
    getStorage()?.setItem(GLIDE_MEASUREMENT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save glide measurement settings:', error);
  }
};

export const getGlideMeasurementConditions = (): GlideConditions => {
  const storage = getStorage();
  const rawSettings = storage?.getItem(GLIDE_MEASUREMENT_SETTINGS_KEY);

  if (!rawSettings) {
    return getDefaultConditions();
  }

  try {
    const storedSettings = StoredGlideMeasurementSettingsSchema.parse(JSON.parse(rawSettings));
    const windConditions =
      storedSettings.windConditions && Date.now() - storedSettings.windConditions.savedAt <= WIND_CONDITIONS_TTL_MS
        ? {
            directionDegrees: storedSettings.windConditions.directionDegrees,
            speedMps: storedSettings.windConditions.speedMps,
          }
        : { ...DEFAULT_GLIDE_CONDITIONS.wind };

    if (storedSettings.windConditions && windConditions.speedMps === 0) {
      writeStoredSettings({
        glideThresholds: storedSettings.glideThresholds,
        airspeedMps: storedSettings.airspeedMps,
      });
    }

    return normalizeGlideConditions({
      glideThresholds: storedSettings.glideThresholds,
      airspeedMps: storedSettings.airspeedMps,
      wind: windConditions,
    });
  } catch (error) {
    console.warn('Failed to parse glide measurement settings:', error);
    storage?.removeItem(GLIDE_MEASUREMENT_SETTINGS_KEY);
    return getDefaultConditions();
  }
};

export const setGlideMeasurementConditions = (conditions: GlideConditions) => {
  const normalized = normalizeGlideConditions(conditions);

  writeStoredSettings({
    glideThresholds: normalized.glideThresholds,
    airspeedMps: normalized.airspeedMps,
    ...(normalized.wind.speedMps > 0
      ? {
          windConditions: {
            ...normalized.wind,
            savedAt: Date.now(),
          },
        }
      : {}),
  });

  return normalized;
};
