import {
  classifyRequiredGlide,
  DEFAULT_GLIDE_CONDITIONS,
  getRequiredGlideRatio,
  getWindAdjustedGlideThresholds,
  getDistanceLabelIntervalMeters,
} from './calculations';

const expectThresholdsToBeCloseTo = (received: number[] | null, expected: number[]) => {
  expect(received).not.toBeNull();
  if (!received) return;

  received.forEach((threshold, index) => {
    expect(threshold).toBeCloseTo(expected[index], 8);
  });
};

describe('getWindAdjustedGlideThresholds', () => {
  it('increases viable ground glide for a tailwind', () => {
    const thresholds = getWindAdjustedGlideThresholds(
      {
        ...DEFAULT_GLIDE_CONDITIONS,
        wind: { directionDegrees: 180, speedMps: 2 },
      },
      0
    );

    expectThresholdsToBeCloseTo(thresholds, [7.2, 9.6, 12]);
  });

  it('reduces viable ground glide for a headwind', () => {
    const thresholds = getWindAdjustedGlideThresholds(
      {
        ...DEFAULT_GLIDE_CONDITIONS,
        wind: { directionDegrees: 0, speedMps: 2 },
      },
      0
    );

    expectThresholdsToBeCloseTo(thresholds, [4.8, 6.4, 8]);
  });

  it('accounts for the forward-speed loss required to crab through a crosswind', () => {
    const thresholds = getWindAdjustedGlideThresholds(
      {
        ...DEFAULT_GLIDE_CONDITIONS,
        wind: { directionDegrees: 90, speedMps: 6 },
      },
      0
    );

    expectThresholdsToBeCloseTo(thresholds, [4.8, 6.4, 8]);
  });

  it('marks the route unavailable when wind cannot be crabbed or overcome', () => {
    const conditions = {
      ...DEFAULT_GLIDE_CONDITIONS,
      wind: { directionDegrees: 90, speedMps: 10 },
    };

    expect(getWindAdjustedGlideThresholds(conditions, 0)).toBeNull();
  });
});

describe('classifyRequiredGlide', () => {
  it('uses each coloured handle as its direct upper glide limit', () => {
    expect(classifyRequiredGlide(6, [6, 8, 10])).toBe('green');
    expect(classifyRequiredGlide(6.01, [6, 8, 10])).toBe('yellow');
    expect(classifyRequiredGlide(8, [6, 8, 10])).toBe('yellow');
    expect(classifyRequiredGlide(8.01, [6, 8, 10])).toBe('red');
    expect(classifyRequiredGlide(10, [6, 8, 10])).toBe('red');
    expect(classifyRequiredGlide(10.01, [6, 8, 10])).toBe('black');
  });

  it('changes directly from green to black when all anchors are stacked', () => {
    expect(classifyRequiredGlide(8, [8, 8, 8])).toBe('green');
    expect(classifyRequiredGlide(8.01, [8, 8, 8])).toBe('black');
  });
});

describe('getRequiredGlideRatio', () => {
  it('keeps the takeoff elevation budget across route-shaping waypoints', () => {
    const takeoffElevationMeters = 1_000;
    const thresholds: [number, number, number] = [6, 8, 10];

    const lakeRequirement = getRequiredGlideRatio(1_000, takeoffElevationMeters, 200);
    const mountainEdgeRequirement = getRequiredGlideRatio(5_000, takeoffElevationMeters, 350);
    const landingRequirement = getRequiredGlideRatio(6_000, takeoffElevationMeters, 0);

    expect(classifyRequiredGlide(lakeRequirement, thresholds)).toBe('green');
    expect(classifyRequiredGlide(mountainEdgeRequirement, thresholds)).toBe('yellow');
    expect(classifyRequiredGlide(landingRequirement, thresholds)).toBe('green');
  });

  it('marks terrain at or above takeoff elevation as unreachable', () => {
    expect(getRequiredGlideRatio(1_000, 500, 500)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('getDistanceLabelIntervalMeters', () => {
  it.each([
    [800, 200],
    [2_000, 500],
    [4_000, 1_000],
    [12_000, 2_000],
  ])('selects an adaptive distance tick for %i m', (distance, expected) => {
    expect(getDistanceLabelIntervalMeters(distance)).toBe(expected);
  });
});
