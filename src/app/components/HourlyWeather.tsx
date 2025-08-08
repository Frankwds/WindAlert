import React from "react";
import { HourlyData } from "../api/cron/types";
import { getWindDirection } from "../lib/wind";
import { getWeatherIcon } from "../lib/weather-icons";

const HourlyWeather = ({ hour }: { hour: HourlyData }) => {
  const weatherIcon = getWeatherIcon(
    hour.weatherData.weatherCode,
    hour.weatherData.isDay
  );

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <div className="mb-4">
        <p className="font-bold">
          {weatherIcon ? weatherIcon.description : "Weather data not available"}
        </p>
        <p>Temperature (2m): {hour.weatherData.temperature2m}°C</p>
        <p>Precipitation: {hour.weatherData.precipitation}mm</p>
        <p>Cloud Cover: {hour.weatherData.cloudCover}%</p>
        <p>Wind Gusts (10m): {hour.weatherData.windGusts10m} m/s</p>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2">Atmospheric Conditions</h4>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold">Altitude</div>
          <div className="font-semibold">Wind Speed (m/s)</div>
          <div className="font-semibold">Wind Direction</div>
          <div className="font-semibold">Temperature (°C)</div>

          <div className="font-medium">1000hPa</div>
          <div>{hour.weatherData.windSpeed1000hPa?.toFixed(2)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection1000hPa)}</div>
          <div>{hour.weatherData.temperature1000hPa?.toFixed(1)}</div>
          <div className="font-medium">925hPa</div>
          <div>{hour.weatherData.windSpeed925hPa?.toFixed(2)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection925hPa)}</div>
          <div>{hour.weatherData.temperature925hPa?.toFixed(1)}</div>
          <div className="font-medium">850hPa</div>
          <div>{hour.weatherData.windSpeed850hPa?.toFixed(2)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection850hPa)}</div>
          <div>{hour.weatherData.temperature850hPa?.toFixed(1)}</div>
          <div className="font-medium">700hPa</div>
          <div>{hour.weatherData.windSpeed700hPa?.toFixed(2)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection700hPa)}</div>
          <div>{hour.weatherData.temperature700hPa?.toFixed(1)}</div>
          <div className="font-medium">10m</div>
          <div>{hour.weatherData.windSpeed10m?.toFixed(2)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection10m)}</div>
          <div>{hour.weatherData.temperature2m?.toFixed(1)}</div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2">
          Additional Atmospheric Details
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>Precipitation Probability:</div>
          <div>{hour.weatherData.precipitationProbability}%</div>
          <div>MSL Pressure:</div>
          <div>{hour.weatherData.pressureMsl} hPa</div>
          <div>Convective Inhibition:</div>
          <div>{hour.weatherData.convectiveInhibition} J/kg</div>
          <div>Low Cloud Cover:</div>
          <div>{hour.weatherData.cloudCoverLow}%</div>
          <div>Mid Cloud Cover:</div>
          <div>{hour.weatherData.cloudCoverMid}%</div>
          <div>High Cloud Cover:</div>
          <div>{hour.weatherData.cloudCoverHigh}%</div>
          <div>Freezing Level:</div>
          <div>{hour.weatherData.freezingLevelHeight} m</div>
          <div>CAPE:</div>
          <div>{hour.weatherData.cape} J/kg</div>
          <div>Lifted Index:</div>
          <div>{hour.weatherData.liftedIndex}</div>
          <div>Boundary Layer Height:</div>
          <div>{hour.weatherData.boundaryLayerHeight} m</div>
        </div>
      </div>
    </div>
  );
};

export default HourlyWeather;
