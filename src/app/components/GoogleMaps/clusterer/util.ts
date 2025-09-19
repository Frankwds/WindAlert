export interface WindData {
  windSpeed: number;
  windDirection: number;
}

export const getDominantWind = (markers: any[]): WindData => {
  // Extract wind data from clustered markers
  const windData = markers
    .map(marker => {
      const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
      const windSpeed = parseFloat((advancedMarker.content as HTMLElement)?.dataset.windSpeed || '0');
      const windDirection = parseFloat((advancedMarker.content as HTMLElement)?.dataset.windDirection || '0');
      return { windSpeed, windDirection };
    })

  if (windData.length === 0) {
    return { windSpeed: 0, windDirection: 0 };
  }

  // Find the marker with maximum wind speed
  const maxWindData = windData.reduce((max, current) =>
    current.windSpeed > max.windSpeed ? current : max
  );

  return {
    windSpeed: maxWindData.windSpeed,
    windDirection: maxWindData.windDirection,
  };
};
