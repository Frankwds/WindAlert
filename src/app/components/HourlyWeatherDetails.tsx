"use client";

import React from "react";
import { getWindDirection } from "../../lib/utils/getWindDirection";
import { getWeatherIcon } from "../../lib/utils/getWeatherIcons";
import WindDirectionArrow from "./WindDirectionArrow";
import { ForecastCache1hr } from "@/lib/supabase/types";

const HourlyWeatherDetails = ({ hour }: { hour: ForecastCache1hr }) => {
  const weatherIcon = getWeatherIcon(hour.weather_code);

  return (
    <div className="text-[var(--foreground)]">
      <div className="mb-4">
        <p className="font-bold text-[var(--foreground)]">
          {weatherIcon ? weatherIcon.description : "Weather data not available"}
        </p>
        <p className="text-[var(--foreground)]">Temperature (2m): {hour.temperature}°C</p>
        <p className="text-[var(--foreground)]">Precipitation: {hour.precipitation}mm</p>
        <p className="text-[var(--foreground)]">Cloud Cover: {hour.cloud_cover}%</p>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2 text-[var(--foreground)]">Atmospheric Conditions</h4>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold">Altitude</div>
          <div className="font-semibold">Wind (m/s)</div>
          <div className="font-semibold">Wind Dir.</div>
          <div className="font-semibold">Temp. (°C)</div>

          <div className="font-medium">0m</div>
          <div className="text-[var(--foreground)]">
            <span className="font-medium">{Math.round(hour.wind_speed)} ( {Math.round(hour.wind_gusts)})</span>

          </div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction} size={20} color="var(--foreground)" />
            <span className="text-xs text-[var(--foreground)]">{getWindDirection(hour.wind_direction)}</span>
          </div>
          <div className="text-[var(--foreground)] font-medium">{Math.round(hour.temperature)}</div>
          <div className="font-medium">
            {hour.geopotential_height_925hpa}m
          </div>
          <div>{Math.round(hour.wind_speed_1000hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_1000hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_1000hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_1000hpa)}</div>
          <div className="font-medium">
            {hour.geopotential_height_925hpa}m
          </div>
          <div>{Math.round(hour.wind_speed_925hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_925hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_925hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_925hpa)}</div>
          <div className="font-medium">
            {hour.geopotential_height_850hpa}m
          </div>
          <div>{Math.round(hour.wind_speed_850hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_850hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_850hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_850hpa)}</div>
          <div className="font-medium">
            {hour.geopotential_height_700hpa}m
          </div>
          <div>{Math.round(hour.wind_speed_700hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_700hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_700hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_700hpa)}</div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2 text-[var(--foreground)]">
          Atmospheric Details
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Precipitation Probability:</span>
            <span className="font-medium">{hour.precipitation_probability}%</span>
          </div>
          <div className="flex justify-between">
            <span>Convective Inhibition:</span>
            <span className="font-medium">{hour.convective_inhibition} J/kg</span>
          </div>
          <div className="flex justify-between">
            <span>Boundary Layer Height:</span>
            <span className="font-medium">{hour.boundary_layer_height} m</span>
          </div>
          <div className="flex justify-between">
            <span>Lifted Index:</span>
            <span className="font-medium">{hour.lifted_index}</span>
          </div>
          <div className="flex justify-between">
            <span>CAPE:</span>
            <span className="font-medium">{hour.cape} J/kg</span>
          </div>
          <div className="flex justify-between">
            <span>Freezing Level:</span>
            <span className="font-medium">{hour.freezing_level_height} m</span>
          </div>
          <div className="flex justify-between">
            <span>Low Cloud Cover:</span>
            <span className="font-medium">{hour.cloud_cover_low}%</span>
          </div>
          <div className="flex justify-between">
            <span>Mid Cloud Cover:</span>
            <span className="font-medium">{hour.cloud_cover_mid}%</span>
          </div>
          <div className="flex justify-between">
            <span>High Cloud Cover:</span>
            <span className="font-medium">{hour.cloud_cover_high}%</span>
          </div>
          <div className="flex justify-between">
            <span>MSL Pressure:</span>
            <span className="font-medium">{hour.pressure_msl} hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyWeatherDetails;
