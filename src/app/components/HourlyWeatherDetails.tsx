"use client";

import React from "react";
import { HourlyData } from "../../lib/openMeteo/types";
import { getWindDirection } from "../../lib/utils/getWindDirection";
import { getWeatherIcon } from "../../lib/utils/getWeatherIcons";
import WindDirectionArrow from "./WindDirectionArrow";

const HourlyWeatherDetails = ({ hour }: { hour: HourlyData }) => {
  const weatherIcon = getWeatherIcon(hour.weatherData.weatherCode);

  return (
    <div className="text-[var(--foreground)]">
      <div className="mb-4">
        <p className="font-bold text-[var(--foreground)]">
          {weatherIcon ? weatherIcon.description : "Weather data not available"}
        </p>
        <p className="text-[var(--foreground)]">Temperature (2m): {hour.weatherData.temperature2m}°C</p>
        <p className="text-[var(--foreground)]">Precipitation: {hour.weatherData.precipitation}mm</p>
        <p className="text-[var(--foreground)]">Cloud Cover: {hour.weatherData.cloudCover}%</p>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2 text-[var(--foreground)]">Atmospheric Conditions</h4>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold">Altitude</div>
          <div className="font-semibold">Wind (m/s)</div>
          <div className="font-semibold">Wind Dir.</div>
          <div className="font-semibold">Temp. (°C)</div>

          <div className="font-medium">10m</div>
          <div className="text-[var(--foreground)]">
            <span className="font-medium">{Math.round(hour.weatherData.windSpeed10m)} ( {Math.round(hour.weatherData.windGusts10m)})</span>

          </div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.weatherData.windDirection10m} size={20} color="var(--foreground)" />
            <span className="text-xs text-[var(--foreground)]">{getWindDirection(hour.weatherData.windDirection10m)}</span>
          </div>
          <div className="text-[var(--foreground)] font-medium">{Math.round(hour.weatherData.temperature2m)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight1000hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed1000hPa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.weatherData.windDirection1000hPa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.weatherData.windDirection1000hPa)}</span>
          </div>
          <div>{Math.round(hour.weatherData.temperature1000hPa)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight925hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed925hPa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.weatherData.windDirection925hPa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.weatherData.windDirection925hPa)}</span>
          </div>
          <div>{Math.round(hour.weatherData.temperature925hPa)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight850hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed850hPa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.weatherData.windDirection850hPa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.weatherData.windDirection850hPa)}</span>
          </div>
          <div>{Math.round(hour.weatherData.temperature850hPa)}</div>
          <div className="font-medium">
            {hour.weatherData.geopotentialHeight700hPa}m
          </div>
          <div>{Math.round(hour.weatherData.windSpeed700hPa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.weatherData.windDirection700hPa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.weatherData.windDirection700hPa)}</span>
          </div>
          <div>{Math.round(hour.weatherData.temperature700hPa)}</div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2 text-[var(--foreground)]">
          Atmospheric Details
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Precipitation Probability:</span>
            <span className="font-medium">{hour.weatherData.precipitationProbability}%</span>
          </div>
          <div className="flex justify-between">
            <span>Convective Inhibition:</span>
            <span className="font-medium">{hour.weatherData.convectiveInhibition} J/kg</span>
          </div>
          <div className="flex justify-between">
            <span>Boundary Layer Height:</span>
            <span className="font-medium">{hour.weatherData.boundaryLayerHeight} m</span>
          </div>
          <div className="flex justify-between">
            <span>Lifted Index:</span>
            <span className="font-medium">{hour.weatherData.liftedIndex}</span>
          </div>
          <div className="flex justify-between">
            <span>CAPE:</span>
            <span className="font-medium">{hour.weatherData.cape} J/kg</span>
          </div>
          <div className="flex justify-between">
            <span>Freezing Level:</span>
            <span className="font-medium">{hour.weatherData.freezingLevelHeight} m</span>
          </div>
          <div className="flex justify-between">
            <span>Low Cloud Cover:</span>
            <span className="font-medium">{hour.weatherData.cloudCoverLow}%</span>
          </div>
          <div className="flex justify-between">
            <span>Mid Cloud Cover:</span>
            <span className="font-medium">{hour.weatherData.cloudCoverMid}%</span>
          </div>
          <div className="flex justify-between">
            <span>High Cloud Cover:</span>
            <span className="font-medium">{hour.weatherData.cloudCoverHigh}%</span>
          </div>
          <div className="flex justify-between">
            <span>MSL Pressure:</span>
            <span className="font-medium">{hour.weatherData.pressureMsl} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyWeatherDetails;
