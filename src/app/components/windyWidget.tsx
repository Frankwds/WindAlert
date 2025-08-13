"use client";

import { useState } from "react";

interface WindyWidgetProps {
  lat: number;
  long: number;
}

const WindyWidget: React.FC<WindyWidgetProps> = ({ lat, long }) => {
  const levels = ["surface", "1000h", "925h", "850h", "700h"];
  const [levelIndex, setLevelIndex] = useState(0);

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevelIndex(parseInt(event.target.value, 10));
  };

  const level = levels[levelIndex];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Windy Widget</h2>
      <div className="flex items-start gap-4">
        <iframe
          width="650"
          height="450"
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=8&overlay=wind&product=icon&level=${level}&lat=${lat}&lon=${long}`}
        ></iframe>
        <div className="flex flex-col items-center">
          <input
            id="level-slider"
            type="range"
            min="0"
            max={levels.length - 1}
            value={levelIndex}
            onChange={handleLevelChange}
            className="h-[450px] w-2 [-webkit-appearance:slider-vertical] [writing-mode:bt-lr]"
          />
          <label htmlFor="level-slider" className="mt-2 text-center">
            Elevation:
            <br />
            {level === "surface" ? "Surface" : `${level}`}
          </label>
        </div>
      </div>
    </div>
  );
};

export default WindyWidget;
