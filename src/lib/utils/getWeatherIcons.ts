interface WeatherIconData {
  description: string;
  image: string;
}

export const getWeatherIcon = (weatherCode: string): WeatherIconData | null => {
  const iconData = weatherIconsMap[weatherCode];
  if (!iconData) {
    return null;
  }
  return iconData;
};

const weatherIconsMap: { [key: string]: WeatherIconData } = {
  "clearsky_day": { description: "Clear sky", image: "/weather-icons/clearsky_day.svg" },
  "clearsky_night": { description: "Clear sky", image: "/weather-icons/clearsky_night.svg" },
  "fair_day": { description: "Fair", image: "/weather-icons/fair_day.svg" },
  "fair_night": { description: "Fair", image: "/weather-icons/fair_night.svg" },
  "partlycloudy_day": { description: "Partly cloudy", image: "/weather-icons/partlycloudy_day.svg" },
  "partlycloudy_night": { description: "Partly cloudy", image: "/weather-icons/partlycloudy_night.svg" },
  "cloudy": { description: "Cloudy", image: "/weather-icons/cloudy.svg" },
  "rainshowers_day": { description: "Rain showers", image: "/weather-icons/rainshowers_day.svg" },
  "rainshowers_night": { description: "Rain showers", image: "/weather-icons/rainshowers_night.svg" },
  "rainshowersandthunder_day": { description: "Rain showers and thunder", image: "/weather-icons/rainshowersandthunder_day.svg" },
  "rainshowersandthunder_night": { description: "Rain showers and thunder", image: "/weather-icons/rainshowersandthunder_night.svg" },
  "sleetshowers_day": { description: "Sleet showers", image: "/weather-icons/sleetshowers_day.svg" },
  "sleetshowers_night": { description: "Sleet showers", image: "/weather-icons/sleetshowers_night.svg" },
  "snowshowers_day": { description: "Snow showers", image: "/weather-icons/snowshowers_day.svg" },
  "snowshowers_night": { description: "Snow showers", image: "/weather-icons/snowshowers_night.svg" },
  "rain": { description: "Rain", image: "/weather-icons/rain.svg" },
  "heavyrain": { description: "Heavy rain", image: "/weather-icons/heavyrain.svg" },
  "heavyrainandthunder": { description: "Heavy rain and thunder", image: "/weather-icons/heavyrainandthunder.svg" },
  "sleet": { description: "Sleet", image: "/weather-icons/sleet.svg" },
  "snow": { description: "Snow", image: "/weather-icons/snow.svg" },
  "snowandthunder": { description: "Snow and thunder", image: "/weather-icons/snowandthunder.svg" },
  "fog": { description: "Fog", image: "/weather-icons/fog.svg" },
  "sleetshowersandthunder_day": { description: "Sleet showers and thunder", image: "/weather-icons/sleetshowersandthunder_day.svg" },
  "sleetshowersandthunder_night": { description: "Sleet showers and thunder", image: "/weather-icons/sleetshowersandthunder_night.svg" },
  "snowshowersandthunder_day": { description: "Snow showers and thunder", image: "/weather-icons/snowshowersandthunder_day.svg" },
  "snowshowersandthunder_night": { description: "Snow showers and thunder", image: "/weather-icons/snowshowersandthunder_night.svg" },
  "rainandthunder": { description: "Rain and thunder", image: "/weather-icons/rainandthunder.svg" },
  "sleetandthunder": { description: "Sleet and thunder", image: "/weather-icons/sleetandthunder.svg" },
  "lightrainshowersandthunder_day": { description: "Light rain showers and thunder", image: "/weather-icons/lightrainshowersandthunder_day.svg" },
  "lightrainshowersandthunder_night": { description: "Light rain showers and thunder", image: "/weather-icons/lightrainshowersandthunder_night.svg" },
  "heavyrainshowersandthunder_day": { description: "Heavy rain showers and thunder", image: "/weather-icons/heavyrainshowersandthunder_day.svg" },
  "heavyrainshowersandthunder_night": { description: "Heavy rain showers and thunder", image: "/weather-icons/heavyrainshowersandthunder_night.svg" },
  "lightssleetshowersandthunder_day": { description: "Light sleet showers and thunder", image: "/weather-icons/lightssleetshowersandthunder_day.svg" },
  "lightssleetshowersandthunder_night": { description: "Light sleet showers and thunder", image: "/weather-icons/lightssleetshowersandthunder_night.svg" },
  "heavysleetshowersandthunder_day": { description: "Heavy sleet showers and thunder", image: "/weather-icons/heavysleetshowersandthunder_day.svg" },
  "heavysleetshowersandthunder_night": { description: "Heavy sleet showers and thunder", image: "/weather-icons/heavysleetshowersandthunder_night.svg" },
  "lightssnowshowersandthunder_day": { description: "Light snow showers and thunder", image: "/weather-icons/lightssnowshowersandthunder_day.svg" },
  "lightssnowshowersandthunder_night": { description: "Light snow showers and thunder", image: "/weather-icons/lightssnowshowersandthunder_night.svg" },
  "heavysnowshowersandthunder_day": { description: "Heavy snow showers and thunder", image: "/weather-icons/heavysnowshowersandthunder_day.svg" },
  "heavysnowshowersandthunder_night": { description: "Heavy snow showers and thunder", image: "/weather-icons/heavysnowshowersandthunder_night.svg" },
  "lightrainandthunder": { description: "Light rain and thunder", image: "/weather-icons/lightrainandthunder.svg" },
  "lightsleetandthunder": { description: "Light sleet and thunder", image: "/weather-icons/lightsleetandthunder.svg" },
  "heavysleetandthunder": { description: "Heavy sleet and thunder", image: "/weather-icons/heavysleetandthunder.svg" },
  "lightsnowandthunder": { description: "Light snow and thunder", image: "/weather-icons/lightsnowandthunder.svg" },
  "heavysnowandthunder": { description: "Heavy snow and thunder", image: "/weather-icons/heavysnowandthunder.svg" },
  "lightrainshowers_day": { description: "Light rain showers", image: "/weather-icons/lightrainshowers_day.svg" },
  "lightrainshowers_night": { description: "Light rain showers", image: "/weather-icons/lightrainshowers_night.svg" },
  "heavyrainshowers_day": { description: "Heavy rain showers", image: "/weather-icons/heavyrainshowers_day.svg" },
  "heavyrainshowers_night": { description: "Heavy rain showers", image: "/weather-icons/heavyrainshowers_night.svg" },
  "lightsleetshowers_day": { description: "Light sleet showers", image: "/weather-icons/lightsleetshowers_day.svg" },
  "lightsleetshowers_night": { description: "Light sleet showers", image: "/weather-icons/lightsleetshowers_night.svg" },
  "heavysleetshowers_day": { description: "Heavy sleet showers", image: "/weather-icons/heavysleetshowers_day.svg" },
  "heavysleetshowers_night": { description: "Heavy sleet showers", image: "/weather-icons/heavysleetshowers_night.svg" },
  "lightsnowshowers_day": { description: "Light snow showers", image: "/weather-icons/lightsnowshowers_day.svg" },
  "lightsnowshowers_night": { description: "Light snow showers", image: "/weather-icons/lightsnowshowers_night.svg" },
  "heavysnowshowers_day": { description: "Heavy snow showers", image: "/weather-icons/heavysnowshowers_day.svg" },
  "heavysnowshowers_night": { description: "Heavy snow showers", image: "/weather-icons/heavysnowshowers_night.svg" },
  "lightrain": { description: "Light rain", image: "/weather-icons/lightrain.svg" },
  "lightsleet": { description: "Light sleet", image: "/weather-icons/lightsleet.svg" },
  "heavysleet": { description: "Heavy sleet", image: "/weather-icons/heavysleet.svg" },
  "lightsnow": { description: "Light snow", image: "/weather-icons/lightsnow.svg" },
  "heavysnow": { description: "Heavy snow", image: "/weather-icons/heavysnow.svg" }
};

