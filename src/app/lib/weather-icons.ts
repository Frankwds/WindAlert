export interface WeatherIconData {
  description: string;
  image: string;
}

export interface WeatherIcons {
  [key: string]: {
    day: WeatherIconData;
    night: WeatherIconData;
  };
}

export const weatherIcons: WeatherIcons = {
  "1": {
    day: { description: "Clear sky", image: "/weather-icons/clearsky_day.svg" },
    night: { description: "Clear sky", image: "/weather-icons/clearsky_night.svg" }
  },
  "2": {
    day: { description: "Fair", image: "/weather-icons/fair_day.svg" },
    night: { description: "Fair", image: "/weather-icons/fair_night.svg" }
  },
  "3": {
    day: { description: "Partly cloudy", image: "/weather-icons/partlycloudy_day.svg" },
    night: { description: "Partly cloudy", image: "/weather-icons/partlycloudy_night.svg" }
  },
  "4": {
    day: { description: "Cloudy", image: "/weather-icons/cloudy_day.svg" },
    night: { description: "Cloudy", image: "/weather-icons/cloudy_night.svg" }
  },
  "5": {
    day: { description: "Rain showers", image: "/weather-icons/rainshowers_day.svg" },
    night: { description: "Rain showers", image: "/weather-icons/rainshowers_night.svg" }
  },
  "6": {
    day: { description: "Rain showers and thunder", image: "/weather-icons/rainshowersandthunder_day.svg" },
    night: { description: "Rain showers and thunder", image: "/weather-icons/rainshowersandthunder_night.svg" }
  },
  "7": {
    day: { description: "Sleet showers", image: "/weather-icons/sleetshowers_day.svg" },
    night: { description: "Sleet showers", image: "/weather-icons/sleetshowers_night.svg" }
  },
  "8": {
    day: { description: "Snow showers", image: "/weather-icons/snowshowers_day.svg" },
    night: { description: "Snow showers", image: "/weather-icons/snowshowers_night.svg" }
  },
  "9": {
    day: { description: "Rain", image: "/weather-icons/rain_day.svg" },
    night: { description: "Rain", image: "/weather-icons/rain_night.svg" }
  },
  "10": {
    day: { description: "Heavy rain", image: "/weather-icons/heavyrain_day.svg" },
    night: { description: "Heavy rain", image: "/weather-icons/heavyrain_night.svg" }
  },
  "11": {
    day: { description: "Heavy rain and thunder", image: "/weather-icons/heavyrainandthunder_day.svg" },
    night: { description: "Heavy rain and thunder", image: "/weather-icons/heavyrainandthunder_night.svg" }
  },
  "12": {
    day: { description: "Sleet", image: "/weather-icons/sleet_day.svg" },
    night: { description: "Sleet", image: "/weather-icons/sleet_night.svg" }
  },
  "13": {
    day: { description: "Snow", image: "/weather-icons/snow_day.svg" },
    night: { description: "Snow", image: "/weather-icons/snow_night.svg" }
  },
  "14": {
    day: { description: "Snow and thunder", image: "/weather-icons/snowandthunder_day.svg" },
    night: { description: "Snow and thunder", image: "/weather-icons/snowandthunder_night.svg" }
  },
  "15": {
    day: { description: "Fog", image: "/weather-icons/fog_day.svg" },
    night: { description: "Fog", image: "/weather-icons/fog_night.svg" }
  },
  "20": {
    day: { description: "Sleet showers and thunder", image: "/weather-icons/sleetshowersandthunder_day.svg" },
    night: { description: "Sleet showers and thunder", image: "/weather-icons/sleetshowersandthunder_night.svg" }
  },
  "21": {
    day: { description: "Snow showers and thunder", image: "/weather-icons/snowshowersandthunder_day.svg" },
    night: { description: "Snow showers and thunder", image: "/weather-icons/snowshowersandthunder_night.svg" }
  },
  "22": {
    day: { description: "Rain and thunder", image: "/weather-icons/rainandthunder_day.svg" },
    night: { description: "Rain and thunder", image: "/weather-icons/rainandthunder_night.svg" }
  },
  "23": {
    day: { description: "Sleet and thunder", image: "/weather-icons/sleetandthunder_day.svg" },
    night: { description: "Sleet and thunder", image: "/weather-icons/sleetandthunder_night.svg" }
  },
  "24": {
    day: { description: "Light rain showers and thunder", image: "/weather-icons/lightrainshowersandthunder_day.svg" },
    night: { description: "Light rain showers and thunder", image: "/weather-icons/lightrainshowersandthunder_night.svg" }
  },
  "25": {
    day: { description: "Heavy rain showers and thunder", image: "/weather-icons/heavyrainshowersandthunder_day.svg" },
    night: { description: "Heavy rain showers and thunder", image: "/weather-icons/heavyrainshowersandthunder_night.svg" }
  },
  "26": {
    day: { description: "Light sleet showers and thunder", image: "/weather-icons/lightsleetshowersandthunder_day.svg" },
    night: { description: "Light sleet showers and thunder", image: "/weather-icons/lightsleetshowersandthunder_night.svg" }
  },
  "27": {
    day: { description: "Heavy sleet showers and thunder", image: "/weather-icons/heavysleetshowersandthunder_day.svg" },
    night: { description: "Heavy sleet showers and thunder", image: "/weather-icons/heavysleetshowersandthunder_night.svg" }
  },
  "28": {
    day: { description: "Light snow showers and thunder", image: "/weather-icons/lightsnowshowersandthunder_day.svg" },
    night: { description: "Light snow showers and thunder", image: "/weather-icons/lightsnowshowersandthunder_night.svg" }
  },
  "29": {
    day: { description: "Heavy snow showers and thunder", image: "/weather-icons/heavysnowshowersandthunder_day.svg" },
    night: { description: "Heavy snow showers and thunder", image: "/weather-icons/heavysnowshowersandthunder_night.svg" }
  },
  "30": {
    day: { description: "Light rain and thunder", image: "/weather-icons/lightrainandthunder_day.svg" },
    night: { description: "Light rain and thunder", image: "/weather-icons/lightrainandthunder_night.svg" }
  },
  "31": {
    day: { description: "Light sleet and thunder", image: "/weather-icons/lightsleetandthunder_day.svg" },
    night: { description: "Light sleet and thunder", image: "/weather-icons/lightsleetandthunder_night.svg" }
  },
  "32": {
    day: { description: "Heavy sleet and thunder", image: "/weather-icons/heavysleetandthunder_day.svg" },
    night: { description: "Heavy sleet and thunder", image: "/weather-icons/heavysleetandthunder_night.svg" }
  },
  "33": {
    day: { description: "Light snow and thunder", image: "/weather-icons/lightsnowandthunder_day.svg" },
    night: { description: "Light snow and thunder", image: "/weather-icons/lightsnowandthunder_night.svg" }
  },
  "34": {
    day: { description: "Heavy snow and thunder", image: "/weather-icons/heavysnowandthunder_day.svg" },
    night: { description: "Heavy snow and thunder", image: "/weather-icons/heavysnowandthunder_night.svg" }
  },
  "40": {
    day: { description: "Light rain showers", image: "/weather-icons/lightrainshowers_day.svg" },
    night: { description: "Light rain showers", image: "/weather-icons/lightrainshowers_night.svg" }
  },
  "41": {
    day: { description: "Heavy rain showers", image: "/weather-icons/heavyrainshowers_day.svg" },
    night: { description: "Heavy rain showers", image: "/weather-icons/heavyrainshowers_night.svg" }
  },
  "42": {
    day: { description: "Light sleet showers", image: "/weather-icons/lightsleetshowers_day.svg" },
    night: { description: "Light sleet showers", image: "/weather-icons/lightsleetshowers_night.svg" }
  },
  "43": {
    day: { description: "Heavy sleet showers", image: "/weather-icons/heavysleetshowers_day.svg" },
    night: { description: "Heavy sleet showers", image: "/weather-icons/heavysleetshowers_night.svg" }
  },
  "44": {
    day: { description: "Light snow showers", image: "/weather-icons/lightsnowshowers_day.svg" },
    night: { description: "Light snow showers", image: "/weather-icons/lightsnowshowers_night.svg" }
  },
  "45": {
    day: { description: "Heavy snow showers", image: "/weather-icons/heavysnowshowers_day.svg" },
    night: { description: "Heavy snow showers", image: "/weather-icons/heavysnowshowers_night.svg" }
  },
  "46": {
    day: { description: "Light rain", image: "/weather-icons/lightrain_day.svg" },
    night: { description: "Light rain", image: "/weather-icons/lightrain_night.svg" }
  },
  "47": {
    day: { description: "Light sleet", image: "/weather-icons/lightsleet_day.svg" },
    night: { description: "Light sleet", image: "/weather-icons/lightsleet_night.svg" }
  },
  "48": {
    day: { description: "Heavy sleet", image: "/weather-icons/heavysleet_day.svg" },
    night: { description: "Heavy sleet", image: "/weather-icons/heavysleet_night.svg" }
  },
  "49": {
    day: { description: "Light snow", image: "/weather-icons/lightsnow_day.svg" },
    night: { description: "Light snow", image: "/weather-icons/lightsnow_night.svg" }
  },
  "50": {
    day: { description: "Heavy snow", image: "/weather-icons/heavysnow_day.svg" },
    night: { description: "Heavy snow", image: "/weather-icons/heavysnow_night.svg" }
  }
};

export const getWeatherIcon = (weatherCode: number, isDay: 0 | 1): WeatherIconData | null => {
  const iconSet = weatherIcons[weatherCode];
  if (!iconSet) {
    return null;
  }
  return isDay ? iconSet.day : iconSet.night;
};
