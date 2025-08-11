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
  "0": {
    day: {
      description: "Sunny",
      image: "/weather-icons/clearsky_day.svg",
    },
    night: {
      description: "Clear",
      image: "/weather-icons/clearsky_night.svg",
    },
  },
  "1": {
    day: {
      description: "Mainly Sunny",
      image: "/weather-icons/clearsky_day.svg",
    },
    night: {
      description: "Mainly Clear",
      image: "/weather-icons/clearsky_night.svg",
    },
  },
  "2": {
    day: {
      description: "Partly Cloudy",
      image: "https://openweathermap.org/img/wn/02d@2x.png",
    },
    night: {
      description: "Partly Cloudy",
      image: "https://openweathermap.org/img/wn/02n@2x.png",
    },
  },
  "3": {
    day: {
      description: "Cloudy",
      image: "https://openweathermap.org/img/wn/03d@2x.png",
    },
    night: {
      description: "Cloudy",
      image: "https://openweathermap.org/img/wn/03n@2x.png",
    },
  },
  "45": {
    day: {
      description: "Foggy",
      image: "https://openweathermap.org/img/wn/50d@2x.png",
    },
    night: {
      description: "Foggy",
      image: "https://openweathermap.org/img/wn/50n@2x.png",
    },
  },
  "48": {
    day: {
      description: "Rime Fog",
      image: "https://openweathermap.org/img/wn/50d@2x.png",
    },
    night: {
      description: "Rime Fog",
      image: "https://openweathermap.org/img/wn/50n@2x.png",
    },
  },
  "51": {
    day: {
      description: "Light Drizzle",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Light Drizzle",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "53": {
    day: {
      description: "Drizzle",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Drizzle",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "55": {
    day: {
      description: "Heavy Drizzle",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Heavy Drizzle",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "56": {
    day: {
      description: "Light Freezing Drizzle",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Light Freezing Drizzle",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "57": {
    day: {
      description: "Freezing Drizzle",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Freezing Drizzle",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "61": {
    day: {
      description: "Light Rain",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Light Rain",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "63": {
    day: {
      description: "Rain",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Rain",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "65": {
    day: {
      description: "Heavy Rain",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Heavy Rain",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "66": {
    day: {
      description: "Light Freezing Rain",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Light Freezing Rain",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "67": {
    day: {
      description: "Freezing Rain",
      image: "https://openweathermap.org/img/wn/10d@2x.png",
    },
    night: {
      description: "Freezing Rain",
      image: "https://openweathermap.org/img/wn/10n@2x.png",
    },
  },
  "71": {
    day: {
      description: "Light Snow",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Light Snow",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "73": {
    day: {
      description: "Snow",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Snow",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "75": {
    day: {
      description: "Heavy Snow",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Heavy Snow",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "77": {
    day: {
      description: "Snow Grains",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Snow Grains",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "80": {
    day: {
      description: "Light Showers",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Light Showers",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "81": {
    day: {
      description: "Showers",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Showers",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "82": {
    day: {
      description: "Heavy Showers",
      image: "https://openweathermap.org/img/wn/09d@2x.png",
    },
    night: {
      description: "Heavy Showers",
      image: "https://openweathermap.org/img/wn/09n@2x.png",
    },
  },
  "85": {
    day: {
      description: "Light Snow Showers",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Light Snow Showers",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "86": {
    day: {
      description: "Snow Showers",
      image: "https://openweathermap.org/img/wn/13d@2x.png",
    },
    night: {
      description: "Snow Showers",
      image: "https://openweathermap.org/img/wn/13n@2x.png",
    },
  },
  "95": {
    day: {
      description: "Thunderstorm",
      image: "https://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Thunderstorm",
      image: "https://openweathermap.org/img/wn/11n@2x.png",
    },
  },
  "96": {
    day: {
      description: "Light Thunderstorms With Hail",
      image: "https://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Light Thunderstorms With Hail",
      image: "https://openweathermap.org/img/wn/11n@2x.png",
    },
  },
  "99": {
    day: {
      description: "Thunderstorm With Hail",
      image: "https://openweathermap.org/img/wn/11d@2x.png",
    },
    night: {
      description: "Thunderstorm With Hail",
      image: "https://openweathermap.org/img/wn/11n@2x.png",
    },
  },
};

export const getWeatherIcon = (weatherCode: number, isDay: 0 | 1): WeatherIconData | null => {
  const iconSet = weatherIcons[weatherCode];
  if (!iconSet) {
    return null;
  }
  return isDay ? iconSet.day : iconSet.night;
};
