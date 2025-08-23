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
      label: "Weather",
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
      label: "Temp (°C)",
      getValue: (hour: WeatherDataPointYr1h) =>
        Math.round(hour.air_temperature),
    },
    {
      label: "Wind (m/s)",
      getValue: (hour: WeatherDataPointYr1h) =>
        `${Math.round(hour.wind_speed)} (${Math.round(
          hour.wind_speed_of_gust
        )})`,
    },
    {
      label: "Direction",
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
      <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Hourly Weather</h2>
      <div className="overflow-x-auto scrollbar-thin transition-all duration-200">
        <table className="min-w-full text-sm text-center">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left text-[var(--muted)]   sticky left-0 bg-[var(--background)] ">
                Metric
              </th>
              {weatherData.map((hour, colIndex) => (
                <th key={colIndex} className="p-2 whitespace-nowrap bg-[var(--background)] text-[var(--foreground)]">
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
                <td className="font-semibold text-left text-[var(--muted)] pr-4 py-2 sticky left-0 bg-[var(--background)] z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                  {row.label}
                </td>
                {weatherData.map((hour, colIndex) => (
                  <td key={colIndex} className="p-2 whitespace-nowrap bg-[var(--background)]">
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
