"use client";

import { useState } from "react";

interface WindyWidgetProps {
  lat: number;
  long: number;
}

const WindyWidget: React.FC<WindyWidgetProps> = ({ lat, long }) => {
  const levels = ["surface", "500", "1000", "1500", "2000"];
  const [levelIndex, setLevelIndex] = useState(0);

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevelIndex(parseInt(event.target.value, 10));
  };

  const level = levels[levelIndex];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Windy Widget</h2>
      <iframe
        width="650"
        height="450"
        src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=7&overlay=wind&product=ecmwf&level=${level}&lat=${lat}&lon=${long}`}
        frameBorder="0"
      ></iframe>
      <div className="mt-4">
        <label htmlFor="level-slider" className="block mb-2">
          Elevation: {level === "surface" ? "Surface" : `${level}m`}
        </label>
        <input
          id="level-slider"
          type="range"
          min="0"
          max={levels.length - 1}
          value={levelIndex}
          onChange={handleLevelChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default WindyWidget;
