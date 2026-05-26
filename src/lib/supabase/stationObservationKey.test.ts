import { stationLatestObservationKey } from './stationObservationKey';

describe('stationLatestObservationKey', () => {
  it('returns updated_at from latest station row', () => {
    const updatedAt = '2026-05-26T18:25:00.000Z';

    expect(
      stationLatestObservationKey({
        station_id: 'station-1',
        wind_speed: 4.2,
        wind_gust: 6.3,
        direction: 270,
        temperature: 10,
        updated_at: updatedAt,
      })
    ).toBe(updatedAt);
  });
});
