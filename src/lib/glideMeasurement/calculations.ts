export type GlideBandColor = 'green' | 'yellow' | 'red' | 'black';

export type GlideThresholds = [number, number, number];

export type WindConditions = {
  directionDegrees: number;
  speedMps: number;
};

export type GlideConditions = {
  glideThresholds: GlideThresholds;
  airspeedMps: number;
  wind: WindConditions;
};

export const GLIDE_THRESHOLD_MIN = 6;
export const GLIDE_THRESHOLD_MAX = 13;
export const AIRSPEED_MIN_MPS = 6;
export const AIRSPEED_MAX_MPS = 16;
export const WIND_SPEED_MIN_MPS = 0;
export const WIND_SPEED_MAX_MPS = 20;

export const DEFAULT_GLIDE_CONDITIONS: GlideConditions = {
  glideThresholds: [8, 9, 11],
  airspeedMps: 10,
  wind: {
    directionDegrees: 0,
    speedMps: 0,
  },
};

export const GLIDE_BAND_COLORS: Record<GlideBandColor, string> = {
  green: '#16a34a',
  yellow: '#eab308',
  red: '#dc2626',
  black: '#111827',
};

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);

export const normalizeDirectionDegrees = (directionDegrees: number) => {
  const normalized = directionDegrees % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

export const normalizeGlideThresholds = (thresholds: GlideThresholds): GlideThresholds => {
  const normalized = thresholds
    .map(threshold => clamp(threshold, GLIDE_THRESHOLD_MIN, GLIDE_THRESHOLD_MAX))
    .sort((a, b) => a - b);

  return [normalized[0], normalized[1], normalized[2]];
};

export const normalizeGlideConditions = (conditions: GlideConditions): GlideConditions => ({
  glideThresholds: normalizeGlideThresholds(conditions.glideThresholds),
  airspeedMps: clamp(conditions.airspeedMps, AIRSPEED_MIN_MPS, AIRSPEED_MAX_MPS),
  wind: {
    directionDegrees: normalizeDirectionDegrees(conditions.wind.directionDegrees),
    speedMps: clamp(conditions.wind.speedMps, WIND_SPEED_MIN_MPS, WIND_SPEED_MAX_MPS),
  },
});

/**
 * Returns ground-distance glide thresholds for a planned track.
 *
 * `wind.directionDegrees` follows meteorological convention: it is the direction the wind comes
 * from. The airspeed vector is crabbed to preserve the route track, so crosswind reduces usable
 * forward ground speed as well as headwind/tailwind changing it.
 */
export const getWindAdjustedGlideThresholds = (
  conditions: GlideConditions,
  courseDegrees: number
): GlideThresholds | null => {
  const normalized = normalizeGlideConditions(conditions);
  const windToDegrees = normalizeDirectionDegrees(normalized.wind.directionDegrees + 180);
  const relativeWindRadians = ((windToDegrees - normalizeDirectionDegrees(courseDegrees)) * Math.PI) / 180;
  const tailwindMps = normalized.wind.speedMps * Math.cos(relativeWindRadians);
  const crosswindMps = normalized.wind.speedMps * Math.sin(relativeWindRadians);
  const crosswindMagnitude = Math.abs(crosswindMps);

  if (crosswindMagnitude >= normalized.airspeedMps) {
    return null;
  }

  const forwardAirspeedMps = Math.sqrt(normalized.airspeedMps ** 2 - crosswindMagnitude ** 2);
  const groundSpeedMps = forwardAirspeedMps + tailwindMps;

  if (groundSpeedMps <= 0) {
    return null;
  }

  const groundSpeedFactor = groundSpeedMps / normalized.airspeedMps;
  const [green, yellow, red] = normalized.glideThresholds;
  return [green * groundSpeedFactor, yellow * groundSpeedFactor, red * groundSpeedFactor];
};

export const classifyRequiredGlide = (
  requiredGlideRatio: number,
  adjustedThresholds: GlideThresholds | null
): GlideBandColor => {
  if (!Number.isFinite(requiredGlideRatio) || requiredGlideRatio < 0 || !adjustedThresholds) {
    return 'black';
  }

  const [green, yellow, red] = adjustedThresholds;

  if (requiredGlideRatio <= green) {
    return 'green';
  }

  if (requiredGlideRatio <= yellow) {
    return 'yellow';
  }

  if (requiredGlideRatio <= red) {
    return 'red';
  }

  return 'black';
};

export const getRequiredGlideRatio = (
  routeDistanceMeters: number,
  takeoffElevationMeters: number,
  terrainElevationMeters: number
) => {
  const availableHeightMeters = takeoffElevationMeters - terrainElevationMeters;
  if (availableHeightMeters <= 0) return Number.POSITIVE_INFINITY;

  return routeDistanceMeters / availableHeightMeters;
};

export const getDistanceLabelIntervalMeters = (totalDistanceMeters: number) => {
  if (totalDistanceMeters <= 1_000) return 200;
  if (totalDistanceMeters <= 2_500) return 500;
  if (totalDistanceMeters <= 5_000) return 1_000;
  if (totalDistanceMeters <= 20_000) return 2_000;
  return 4_000;
};

export const formatDistance = (distanceMeters: number) => {
  if (distanceMeters < 1_000) {
    return `${Math.round(distanceMeters)} m`;
  }

  const kilometres = distanceMeters / 1_000;
  return `${kilometres % 1 === 0 ? kilometres.toFixed(0) : kilometres.toFixed(1)} km`;
};
