import { updateMapState } from '@/lib/localstorage/mapStorage';
import { getWindyUrl } from './externalMapLinks';

describe('Windy menu link', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens the map at 850 hPa using the default view when no map state is saved', () => {
    expect(getWindyUrl()).toBe('https://www.windy.com/?850h,65.000,8.500,5,p:wind');
  });

  it('opens the saved map view at 850 hPa without selecting a point', () => {
    updateMapState({ center: { lat: 62.391, lng: 5.695 }, zoom: 10 });

    expect(getWindyUrl()).toBe('https://www.windy.com/?850h,62.391,5.695,10,p:wind');
  });

  it('reads the latest map view and preserves coordinate and zoom rounding', () => {
    updateMapState({ center: { lat: 62.391, lng: 5.695 }, zoom: 10 });
    getWindyUrl();
    updateMapState({ center: { lat: -33.86882, lng: 151.20929 }, zoom: 8.7 });

    expect(getWindyUrl()).toBe('https://www.windy.com/?850h,-33.869,151.209,9,p:wind');
  });
});
