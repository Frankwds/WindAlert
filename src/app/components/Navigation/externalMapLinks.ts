import { getMapState } from '@/lib/localstorage/mapStorage';

export function getThermalKk7Url(): string {
  const { center, zoom } = getMapState();
  return `https://thermal.kk7.ch/#${center.lat.toFixed(3)},${center.lng.toFixed(3)},${Math.round(zoom)}`;
}

export function getLuftromUrl(): string {
  const { center, zoom } = getMapState();
  return `https://luftrom.info/viewer#${Math.round(zoom)}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`;
}

export function getWindyUrl(): string {
  const { center, zoom } = getMapState();
  const lat = center.lat.toFixed(3);
  const lng = center.lng.toFixed(3);
  return `https://www.windy.com/${lat}/${lng}?${lat},${lng},${Math.round(zoom)},p:wind`;
}
