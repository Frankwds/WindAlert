export interface WindData {
  windSpeed: number;
  windDirection: number;
}

export const getMeanValues = (markers: any[]): WindData => {
  // Extract wind data from clustered markers
  const windSpeeds = markers
    .map(marker => {
      const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
      return parseFloat((advancedMarker.content as HTMLElement)?.dataset.windSpeed || '0');
    })
    .filter(speed => speed > 0);

  const windDirections = markers
    .map(marker => {
      const advancedMarker = marker as google.maps.marker.AdvancedMarkerElement;
      return parseFloat((advancedMarker.content as HTMLElement)?.dataset.windDirection || '0');
    })
    .filter(direction => direction >= 0);


  // Calculate mean wind speed
  const meanWindSpeed = windSpeeds.length > 0
    ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
    : 0;

  // Calculate circular mean for wind direction
  let meanWindDirection = 0;
  if (windDirections.length > 0) {
    const radians = windDirections.map(deg => deg * (Math.PI / 180));
    const xValues = radians.map(rad => Math.cos(rad));
    const yValues = radians.map(rad => Math.sin(rad));

    const meanX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
    const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;

    meanWindDirection = Math.atan2(meanY, meanX) * (180 / Math.PI);
    // Convert to 0-360 range
    meanWindDirection = meanWindDirection < 0 ? meanWindDirection + 360 : meanWindDirection;
  }

  return {
    windSpeed: meanWindSpeed,
    windDirection: meanWindDirection,
  };
};
