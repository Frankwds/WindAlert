import { WeatherDataPoint, HourlyData } from '../types';

const GOOD_CONDITIONS = {
  MIN_WIND_SPEED: 2, // m/s
  MAX_WIND_SPEED: 6, // m/s
  MAX_GUST: 8.0, // m/s
  MAX_PRECIPITATION: 0, // mm
  THUNDERSTORM_CODES: [95, 96, 99],
  MAX_CAPE: 1000, // J/kg
  MIN_LIFTED_INDEX: -4,
  MAX_LIFTED_INDEX: 2,
  MIN_CONVECTIVE_INHIBITION: -50, // J/kg
  MAX_CLOUD_COVER: 70, // %
};

function isGoodParaglidingCondition(dp: WeatherDataPoint): boolean {
  const isWindSpeedGood = dp.windSpeed10m >= GOOD_CONDITIONS.MIN_WIND_SPEED && dp.windSpeed10m <= GOOD_CONDITIONS.MAX_WIND_SPEED;
  const isGustGood = dp.windGusts10m <= GOOD_CONDITIONS.MAX_GUST;
  const isPrecipitationGood = dp.precipitation <= GOOD_CONDITIONS.MAX_PRECIPITATION;
  const isWeatherCodeGood = !GOOD_CONDITIONS.THUNDERSTORM_CODES.includes(dp.weatherCode);
  const isCapeGood = dp.cape < GOOD_CONDITIONS.MAX_CAPE;
  const isLiftedIndexGood = dp.liftedIndex >= GOOD_CONDITIONS.MIN_LIFTED_INDEX && dp.liftedIndex <= GOOD_CONDITIONS.MAX_LIFTED_INDEX;
  const isCinGood = dp.convectiveInhibition > GOOD_CONDITIONS.MIN_CONVECTIVE_INHIBITION;
  const isCloudCoverGood = dp.cloudCover < GOOD_CONDITIONS.MAX_CLOUD_COVER;

  return isWindSpeedGood && isGustGood && isPrecipitationGood && isWeatherCodeGood && isCapeGood && isLiftedIndexGood && isCinGood && isCloudCoverGood;
}

export function validateWeather(data: WeatherDataPoint[]): { overallResult: 'positive' | 'negative', hourlyData: HourlyData[] } {
  const relevantHours = data.filter(dp => {
    const hour = new Date(dp.time).getUTCHours();
    return hour >= 8 && hour <= 20;
  });

  const hourlyData: HourlyData[] = relevantHours.map(dp => ({
    isGood: isGoodParaglidingCondition(dp),
    weatherData: dp,
  }));

  if (relevantHours.length < 3) {
    return { overallResult: 'negative', hourlyData };
  }

  let consecutiveGoodHours = 0;
  let hasMetCondition = false;
  for (const dp of hourlyData) {
    if (dp.isGood) {
      consecutiveGoodHours++;
      if (consecutiveGoodHours >= 3) {
        hasMetCondition = true;
      }
    } else {
      consecutiveGoodHours = 0;
    }
  }

  return {
    overallResult: hasMetCondition ? 'positive' : 'negative',
    hourlyData,
  };
}
