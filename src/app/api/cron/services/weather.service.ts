import { WeatherDataPoint, HourlyData, DayResult } from '../types';

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
  MAX_WIND_SPEED_925hPa: 10, // m/s
  MAX_WIND_SPEED_850hPa: 15, // m/s
  MAX_WIND_SPEED_700hPa: 20, // m/s
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
  const isWindSpeed700hPaGood = dp.windSpeed700hPa <= GOOD_CONDITIONS.MAX_WIND_SPEED_700hPa;
  const isWindSpeed850hPaGood = dp.windSpeed850hPa <= GOOD_CONDITIONS.MAX_WIND_SPEED_850hPa;
  const isWindSpeed925hPaGood = dp.windSpeed925hPa <= GOOD_CONDITIONS.MAX_WIND_SPEED_925hPa;


  return isWindSpeedGood && isGustGood && isPrecipitationGood && isWeatherCodeGood && isCapeGood && isLiftedIndexGood && isCinGood && isCloudCoverGood && isWindSpeed700hPaGood && isWindSpeed850hPaGood && isWindSpeed925hPaGood;
}

export function validateWeather(data: WeatherDataPoint[]): { overallResult: 'positive' | 'negative', dailyData: DayResult[] } {
  const groupedByDay = data.reduce((acc, dp) => {
    const date = dp.time.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(dp);
    return acc;
  }, {} as Record<string, WeatherDataPoint[]>);

  const dailyData: DayResult[] = Object.entries(groupedByDay).map(([date, dayData]) => {
    const relevantHours = dayData.filter(dp => {
      const hour = new Date(dp.time).getUTCHours();
      return hour >= 8 && hour <= 20;
    });

    const hourlyData: HourlyData[] = relevantHours.map(dp => ({
      isGood: isGoodParaglidingCondition(dp),
      weatherData: dp,
    }));

    let consecutiveGoodHours = 0;
    let hasMetCondition = false;
    if (relevantHours.length >= 3) {
      for (const hour of hourlyData) {
        if (hour.isGood) {
          consecutiveGoodHours++;
          if (consecutiveGoodHours >= 3) {
            hasMetCondition = true;
            break;
          }
        } else {
          consecutiveGoodHours = 0;
        }
      }
    }

    return {
      date,
      result: hasMetCondition ? 'positive' : 'negative',
      hourlyData,
    };
  });

  const overallResult = dailyData.some(day => day.result === 'positive') ? 'positive' : 'negative';

  return {
    overallResult,
    dailyData,
  };
}
