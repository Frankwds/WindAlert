"use client";

import React from "react";
import { HourlyData } from "../api/cron/types";
import { getWindDirection } from "../lib/utils/windDirection";
import { getWeatherIcon } from "../lib/utils/weather-icons";

const HourlyWeatherForAlertDebug = ({ hour }: { hour: HourlyData }) => {
  const weatherIcon = getWeatherIcon(hour.weatherData.weatherCode);

  return (
    <div className="p-4 text-white">
      <div className="mb-4">
        <p className="font-bold">
          {weatherIcon ? weatherIcon.description : "Weather data not available"}
        </p>
        <p>Temperature (2m): {hour.weatherData.temperature2m}°C</p>
        <p>Precipitation: {hour.weatherData.precipitation}mm</p>
        <p>Cloud Cover: {hour.weatherData.cloudCover}%</p>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2">Atmospheric Conditions</h4>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold">Altitude</div>
          <div className="font-semibold">Wind Speed (m/s)</div>
          <div className="font-semibold">Wind Direction</div>
          <div className="font-semibold">Temperature (°C)</div>

          <div className="font-medium">10m</div>
          <div>
            {Math.round(hour.weatherData.windSpeed10m)} ({" "}
            {Math.round(hour.weatherData.windGusts10m)} )
          </div>
          <div>{getWindDirection(hour.weatherData.windDirection10m)}</div>
          <div>{Math.round(hour.weatherData.temperature2m)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight1000hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed1000hPa)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection1000hPa)}</div>
          <div>{Math.round(hour.weatherData.temperature1000hPa)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight925hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed925hPa)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection925hPa)}</div>
          <div>{Math.round(hour.weatherData.temperature925hPa)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight850hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed850hPa)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection850hPa)}</div>
          <div>{Math.round(hour.weatherData.temperature850hPa)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight700hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed700hPa)}</div>
          <div>{getWindDirection(hour.weatherData.windDirection700hPa)}</div>
          <div>{Math.round(hour.weatherData.temperature700hPa)}</div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2">
          Additional Atmospheric Details
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>Precipitation Probability:</div>
          <div>{hour.weatherData.precipitationProbability}%</div>
          <div>Convective Inhibition:</div>
          <div>{hour.weatherData.convectiveInhibition} J/kg</div>
          <div>Boundary Layer Height:</div>
          <div>{hour.weatherData.boundaryLayerHeight} m</div>
          <div>Lifted Index:</div>
          <div>{hour.weatherData.liftedIndex}</div>
          <div>CAPE:</div>
          <div>{hour.weatherData.cape} J/kg</div>
          <div>Freezing Level:</div>
          <div>{hour.weatherData.freezingLevelHeight} m</div>
          <div>Low Cloud Cover:</div>
          <div>{hour.weatherData.cloudCoverLow}%</div>
          <div>Mid Cloud Cover:</div>
          <div>{hour.weatherData.cloudCoverMid}%</div>
          <div>High Cloud Cover:</div>
          <div>{hour.weatherData.cloudCoverHigh}%</div>
          <div>MSL Pressure:</div>
          <div>{hour.weatherData.pressureMsl} hPa</div>
        </div>
      </div>
    </div>
  );
};

export default HourlyWeatherForAlertDebug;
