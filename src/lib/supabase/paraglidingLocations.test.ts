import { ParaglidingLocationService } from './paraglidingLocations';

const rangeMock = jest.fn();
const ltMock = jest.fn(() => ({ range: rangeMock }));
const gteMock = jest.fn(() => ({ lt: ltMock }));
const eqMainMock = jest.fn(() => ({ gte: gteMock }));
const eqActiveMock = jest.fn(() => ({ eq: eqMainMock }));
const selectMock = jest.fn(() => ({ eq: eqActiveMock }));
const fromMock = jest.fn(() => ({ select: selectMock }));

jest.mock('./client', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

function pageResult(count: number) {
  return {
    data: Array.from({ length: count }, (_, i) => ({ id: `loc-${i}`, forecast_cache: [] })),
    error: null,
  };
}

describe('ParaglidingLocationService.getAllMainLocationsWithForecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pages through results in chunks of 100 until a short page', async () => {
    rangeMock
      .mockResolvedValueOnce(pageResult(100))
      .mockResolvedValueOnce(pageResult(100))
      .mockResolvedValueOnce(pageResult(47));

    const result = await ParaglidingLocationService.getAllMainLocationsWithForecast();

    expect(fromMock).toHaveBeenCalledWith('all_paragliding_locations');
    expect(rangeMock).toHaveBeenCalledTimes(3);
    expect(rangeMock).toHaveBeenNthCalledWith(1, 0, 99);
    expect(rangeMock).toHaveBeenNthCalledWith(2, 100, 199);
    expect(rangeMock).toHaveBeenNthCalledWith(3, 200, 299);
    expect(result).toHaveLength(247);
  });

  it('throws when a page fails so callers can retry', async () => {
    rangeMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'canceling statement due to statement timeout', code: '57014' },
    });

    await expect(ParaglidingLocationService.getAllMainLocationsWithForecast()).rejects.toMatchObject({
      code: '57014',
    });
  });
});
