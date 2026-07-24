export interface WindData {
  windSpeed: number;
  windDirection: number;
  hasDirection: boolean;
}

export const getDominantWind = (markers: any[]): WindData => {
  // Extract wind data from clustered markers. Markers without a wind direction
  // omit the windDirection dataset entry but still carry windSpeed.
  const windData = markers.map(marker => {
    const el = (marker as google.maps.marker.AdvancedMarkerElement).content as HTMLElement | null;
    const windSpeed = parseFloat(el?.dataset.windSpeed || '0');
    const hasDirection = el?.dataset.windDirection !== undefined;
    const windDirection = parseFloat(el?.dataset.windDirection || '0');
    return { windSpeed, windDirection, hasDirection };
  });

  if (windData.length === 0) {
    return { windSpeed: 0, windDirection: 0, hasDirection: false };
  }

  // Prefer directional markers: the dominant one drives the arrow heading.
  const directional = windData.filter(d => d.hasDirection);
  if (directional.length > 0) {
    const maxWindData = directional.reduce((max, current) => (current.windSpeed > max.windSpeed ? current : max));
    return { windSpeed: maxWindData.windSpeed, windDirection: maxWindData.windDirection, hasDirection: true };
  }

  // No directional markers: colour by the highest wind of the lot.
  const maxSpeed = windData.reduce((max, current) => (current.windSpeed > max.windSpeed ? current : max)).windSpeed;
  return { windSpeed: maxSpeed, windDirection: 0, hasDirection: false };
};
