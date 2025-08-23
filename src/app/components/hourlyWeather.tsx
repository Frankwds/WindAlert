import { WeatherDataPointYr1h } from "@/lib/yr/types";
import { getWeatherIcon } from "@/lib/utils/getWeatherIcons";
import { getWindDirection } from "@/lib/utils/getWindDirection";
import Image from "next/image";
import WindDirectionArrow from "./WindDirectionArrow";

interface HourlyWeatherProps {
  weatherData: WeatherDataPointYr1h[];
  timezone: string;
}

const HourlyWeather: React.FC<HourlyWeatherProps> = ({
  weatherData,
  timezone,
}) => {
  if (!weatherData || weatherData.length === 0) {
    return <p>No hourly weather data available.</p>;
  }

  const dataRows = [
    {
      label: "",
      getValue: (hour: WeatherDataPointYr1h) =>
        new Date(hour.time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: timezone,
        }),
    },
    {
      label: "", // For the icon
      getValue: (hour: WeatherDataPointYr1h) => {
        const weatherIcon = getWeatherIcon(hour.symbol_code);
        return weatherIcon ? (
          <Image
            src={weatherIcon.image}
            alt={weatherIcon.description}
            width={40}
            height={40}
            className="mx-auto"
          />
        ) : null;
      },
    },
    {
      label: "°C",
      getValue: (hour: WeatherDataPointYr1h) =>
        Math.round(hour.air_temperature),
    },
    {
      label: "m/s",
      getValue: (hour: WeatherDataPointYr1h) =>
        `${Math.round(hour.wind_speed)} (${Math.round(
          hour.wind_speed_of_gust
        )})`,
    },
    {
      label: "",
      getValue: (hour: WeatherDataPointYr1h) => (
        <WindDirectionArrow
          direction={hour.wind_from_direction}
          size={24}
          className="mx-auto"
        />
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Hourly Weather</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center">
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="font-semibold text-left text-gray-600 pr-4 py-2 sticky left-0 bg-white">
                  {row.label}
                </td>
                {weatherData.map((hour, colIndex) => (
                  <td key={colIndex} className="p-2 whitespace-nowrap">
                    <div className="w-16 flex items-center justify-center">
                      {row.getValue(hour)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HourlyWeather;
