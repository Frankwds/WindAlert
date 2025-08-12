import { isWindDirectionGood } from '@/app/api/cron/lib/utils/windDirection';

// Test all directions
const dir = { 'N': 0, 'NE': 45, 'E': 90, 'SE': 135, 'S': 180, 'SW': 225, 'W': 270, 'NW': 315 };
for (const [direction, angle] of Object.entries(dir)) {
  it(`should return true for ${direction} direction`, () => {
    expect(isWindDirectionGood(angle, [direction])).toBe(true);
  });
}

describe('isWindDirectionGood', () => {
  it('should return true when allowedDirections is empty', () => {
    expect(isWindDirectionGood(180, [])).toBe(true);
  });

  it('should return true for a wind direction that is within the allowed range for a single allowed direction', () => {
    expect(isWindDirectionGood(90, ['E'])).toBe(true);
  });

  it('should return false for a wind direction that is outside the allowed range for a single allowed direction', () => {
    expect(isWindDirectionGood(180, ['E'])).toBe(false);
  });

  it('should handle the North direction correctly when it crosses 360 degrees', () => {
    expect(isWindDirectionGood(350, ['N'])).toBe(true);
    expect(isWindDirectionGood(10, ['N'])).toBe(true);
    expect(isWindDirectionGood(45, ['N'])).toBe(false);
  });

  it('should return true for a wind direction that is within any of the allowed ranges for multiple allowed directions', () => {
    expect(isWindDirectionGood(45, ['N', 'NE', 'E'])).toBe(true);
    expect(isWindDirectionGood(90, ['N', 'NE', 'E'])).toBe(true);
    expect(isWindDirectionGood(340, ['N', 'NE', 'E'])).toBe(true);
  });

  it('should work fine, also when North is added after other directions', () => {
    expect(isWindDirectionGood(45, ['NE', 'E', 'N'])).toBe(true);
    expect(isWindDirectionGood(90, ['NE', 'E', 'N'])).toBe(true);
    expect(isWindDirectionGood(340, ['NE', 'N', 'E'])).toBe(true);
    expect(isWindDirectionGood(10, ['NE', 'N', 'E'])).toBe(true);
  });

  it('what happens when disjoint directions are entered in the allowedDirections', () => {
    expect(isWindDirectionGood(dir.E, ['N', 'SE'])).toBe(false);
    expect(isWindDirectionGood(dir.S, ['N', 'SE'])).toBe(false);
    expect(isWindDirectionGood(dir.N, ['N', 'SE'])).toBe(true);
    expect(isWindDirectionGood(dir.SE, ['N', 'SE'])).toBe(true);
  });

  it('should return false for a wind direction that is outside all of the allowed ranges for multiple allowed directions', () => {
    expect(isWindDirectionGood(180, ['N', 'NE', 'E'])).toBe(false);
  });

  it('should return false for invalid directions in allowedDirections and no other matching direction', () => {
    expect(isWindDirectionGood(100, ['InvalidDirection'])).toBe(false);
  });

  it('should handle boundary conditions correctly', () => {
    // Test lower and upper bounds for each direction
    expect(isWindDirectionGood(22.5, ['NE'])).toBe(true); // Lower bound of NE
    expect(isWindDirectionGood(67.5, ['NE'])).toBe(true); // Upper bound of NE
    expect(isWindDirectionGood(22.4, ['NE'])).toBe(false);
    expect(isWindDirectionGood(67.6, ['NE'])).toBe(false);

    // Test North boundary
    expect(isWindDirectionGood(337.5, ['N'])).toBe(true); // Lower bound of N
    expect(isWindDirectionGood(22.5, ['N'])).toBe(true); // Upper bound of N
    expect(isWindDirectionGood(337.4, ['N'])).toBe(false);
    expect(isWindDirectionGood(22.6, ['N'])).toBe(false);
  });



});
