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
      getValue: (hour: WeatherDataPointYr1h) =>
        `${Math.round(hour.air_temperature)}°`,
    },
    {
      getValue: (hour: WeatherDataPointYr1h) =>
        `${Math.round(hour.wind_speed)} (${Math.round(
          hour.wind_speed_of_gust
        )})`,
    },
    {
      getValue: (hour: WeatherDataPointYr1h) => (
        <WindDirectionArrow
          direction={hour.wind_from_direction}
          size={24}
          className="mx-auto"
          color="var(--foreground)"
        />
      ),
    },
  ];

  return (
    <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 border border-[var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Forecast from Yr.no</h2>
      <div className="overflow-x-auto overflow-y-hidden scrollbar-thin transition-all duration-200">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="border-b border-[var(--border)]">

              {weatherData.map((hour, colIndex) => (
                <th key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
                  {new Date(hour.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: timezone,
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[var(--border)] last:border-b-0"
              >

                {weatherData.map((hour, colIndex) => (
                  <td key={colIndex} className="px-1 py-1 whitespace-nowrap bg-[var(--background)]">
                    <div className="w-12 flex items-center justify-center">
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
