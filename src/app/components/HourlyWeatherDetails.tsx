"use client";

import React from "react";
import { getWindDirection } from "../../lib/utils/getWindDirection";
import { getWeatherIcon } from "../../lib/utils/getWeatherIcons";
import WindDirectionArrow from "./WindDirectionArrow";
import TinyWindCompass from "./GoogleMaps/TinyWindCompass";
import { ForecastCache1hr } from "@/lib/supabase/types";

const HourlyWeatherDetails = ({ hour, windDirections }: { hour: ForecastCache1hr, windDirections: string[] }) => {
  const weatherIcon = getWeatherIcon(hour.weather_code);

  return (
    <div className="text-[var(--foreground)]">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex-1">
          <p className="font-bold text-[var(--foreground)]">
            {weatherIcon ? weatherIcon.description : "Værdata ikke tilgjengelig"}
          </p>
          <p className="text-[var(--foreground)]">Temperatur (2m): {hour.temperature}°C</p>
          <p className="text-[var(--foreground)]">Nedbør: {hour.precipitation}mm</p>
          <p className="text-[var(--foreground)]">Skydekke: {hour.cloud_cover}%</p>
        </div>
        <div className="flex-shrink-0">
          <TinyWindCompass allowedDirections={windDirections} />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-bold text-lg mb-2 text-[var(--foreground)]">Atmosfæriske forhold</h4>
        <div className="grid grid-cols-5 gap-x-4 gap-y-2 text-sm">
          <div className="font-semibold">Høyde</div>
          <div className="font-semibold">Vind (m/s)</div>
          <div className="font-semibold">Retning</div>
          <div className="font-semibold">Temp. (°C)</div>
          <div className="font-semibold">Δ°C/100m</div>

          <div className="font-medium">0 moh (yr)</div>
          <div className="text-[var(--foreground)]">
            <span className="font-medium">{Math.round(hour.wind_speed)} ( {Math.round(hour.wind_gusts)})</span>

          </div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction} size={20} color="var(--foreground)" />
            <span className="text-xs text-[var(--foreground)]">{getWindDirection(hour.wind_direction)}</span>
          </div>
          <div className="text-[var(--foreground)] font-medium">{Math.round(hour.temperature)}</div>
          <div className="text-[var(--foreground)] font-medium">-</div>
          <div className="font-medium">
            {hour.geopotential_height_1000hpa} moh
          </div>
          <div>{Math.round(hour.wind_speed_1000hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_1000hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_1000hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_1000hpa)}</div>
          <div className="text-[var(--foreground)] font-medium">
            {((hour.temperature_1000hpa - hour.temperature) / (hour.geopotential_height_1000hpa / 100)).toFixed(2)}°C
          </div>
          <div className="font-medium">
            {hour.geopotential_height_925hpa} moh
          </div>
          <div>{Math.round(hour.wind_speed_925hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_925hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_925hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_925hpa)}</div>
          <div className="text-[var(--foreground)] font-medium">
            {((hour.temperature_925hpa - hour.temperature_1000hpa) / ((hour.geopotential_height_925hpa - hour.geopotential_height_1000hpa) / 100)).toFixed(2)}°C
          </div>
          <div className="font-medium">
            {hour.geopotential_height_850hpa} moh
          </div>
          <div>{Math.round(hour.wind_speed_850hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_850hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_850hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_850hpa)}</div>
          <div className="text-[var(--foreground)] font-medium">
            {((hour.temperature_850hpa - hour.temperature_925hpa) / ((hour.geopotential_height_850hpa - hour.geopotential_height_925hpa) / 100)).toFixed(2)}°C
          </div>
          <div className="font-medium">
            {hour.geopotential_height_700hpa} moh
          </div>
          <div>{Math.round(hour.wind_speed_700hpa)}</div>
          <div className="flex items-center gap-2">
            <WindDirectionArrow direction={hour.wind_direction_700hpa} size={20} color="var(--foreground)" />
            <span className="text-xs">{getWindDirection(hour.wind_direction_700hpa)}</span>
          </div>
          <div>{Math.round(hour.temperature_700hpa)}</div>
          <div className="text-[var(--foreground)] font-medium">
            {((hour.temperature_700hpa - hour.temperature_850hpa) / ((hour.geopotential_height_700hpa - hour.geopotential_height_850hpa) / 100)).toFixed(2)}°C
          </div>
        </div>
      </div>
      <div className="mt-4">
        <h4 className="font-bold text-lg mb-3 text-[var(--foreground)]">
          Atmosfæriske detaljer
        </h4>

        {/* Basic Weather Conditions */}
        <div className="mb-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Trykk ved havnivå:</span>
              <span className="font-medium">{hour.pressure_msl} hPa</span>
            </div>
            <div className="flex justify-between">
              <span>Sannsynlighet for nedbør:</span>
              <span className="font-medium">{hour.precipitation_probability}%</span>
            </div>
            <div className="flex justify-between">
              <span>Frysenivå:</span>
              <span className="font-medium">{hour.freezing_level_height} m</span>
            </div>
          </div>
        </div>

        {/* Atmospheric Stability */}
        <div className="mb-4">
          <h5 className="font-semibold text-sm mb-2 text-[var(--foreground)] opacity-80">Atmosfærisk stabilitet</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Konvektiv hemming:</span>
              <span className="font-medium">{hour.convective_inhibition} J/kg</span>
            </div>
            <div className="flex justify-between">
              <span>Grenselagshøyde:</span>
              <span className="font-medium">{hour.boundary_layer_height} m</span>
            </div>
            <div className="flex justify-between">
              <span>Løftet indeks:</span>
              <span className="font-medium">{hour.lifted_index}</span>
            </div>
            <div className="flex justify-between">
              <span>CAPE:</span>
              <span className="font-medium">{hour.cape} J/kg</span>
            </div>
          </div>
        </div>

        {/* Cloud Coverage */}
        <div>
          <h5 className="font-semibold text-sm mb-2 text-[var(--foreground)] opacity-80">Skydekke</h5>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Lavt skydekke:</span>
              <span className="font-medium">{hour.cloud_cover_low}%</span>
            </div>
            <div className="flex justify-between">
              <span>Middels skydekke:</span>
              <span className="font-medium">{hour.cloud_cover_mid}%</span>
            </div>
            <div className="flex justify-between">
              <span>Høyt skydekke:</span>
              <span className="font-medium">{hour.cloud_cover_high}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyWeatherDetails;
