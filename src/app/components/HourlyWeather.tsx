import { HourlyData } from "../api/cron/types";
import { getWeatherIcon } from "../lib/weather-icons";
import Image from "next/image";

interface HourlyWeatherProps {
  hour: HourlyData;
}

const HourlyWeather: React.FC<HourlyWeatherProps> = ({ hour }) => {
  const weatherIcon = getWeatherIcon(
    hour.weatherData.weatherCode,
    hour.weatherData.isDay
  );

  return (
    <div className="flex items-center space-x-4">
      {weatherIcon && (
        <Image
          src={weatherIcon.image}
          alt={weatherIcon.description}
          width={50}
          height={50}
        />
      )}
      <div>
        <p className="font-bold">
          {weatherIcon ? weatherIcon.description : "Weather data not available"}
        </p>
        <p>Temperature: {hour.weatherData.temperature2m}°C</p>
        <p>Precipitation: {hour.weatherData.precipitation}mm</p>
        <p>Wind: {hour.weatherData.windSpeed10m}m/s</p>
      </div>
    </div>
  );
};

export default HourlyWeather;
