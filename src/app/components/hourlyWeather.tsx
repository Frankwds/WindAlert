import { WeatherDataPointYr1h } from "@/lib/yr/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import { getWindDirection } from "@/lib/utils/getWindDirection";
import Image from "next/image";

interface HourlyWeatherProps {
  weatherData: WeatherDataPointYr1h[];
}

const HourlyWeather: React.FC<HourlyWeatherProps> = ({ weatherData }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Hourly Weather</h2>
      <div className="overflow-x-auto">
        <div className="flex space-x-4">
          {weatherData.map((hour, index) => {
            const weatherIcon = getWeatherIcon(hour.symbol_code);
            return (
              <div
                key={index}
                className="flex-shrink-0 w-32 bg-gray-100 rounded-lg p-4 text-center"
              >
                <p className="font-bold">
                  {new Date(hour.time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {weatherIcon && (
                  <Image
                    src={weatherIcon.image}
                    alt={weatherIcon.description}
                    width={50}
                    height={50}
                    className="mx-auto"
                  />
                )}
                <p>{hour.air_temperature}°C</p>
                <p>
                  {hour.wind_speed} ({hour.wind_speed_of_gust}) m/s
                </p>
                <p>{getWindDirection(hour.wind_from_direction)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HourlyWeather;
