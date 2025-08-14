"use client";

import { useState } from "react";

interface WindyWidgetProps {
  lat: number;
  long: number;
}

const WindyWidget: React.FC<WindyWidgetProps> = ({ lat, long }) => {
  const levelMapping = [
    { display: "Surface", api: "surface" },
    { display: "100m", api: "1000h" },
    { display: "600m", api: "950h" },
    { display: "750m", api: "925h" },
    { display: "900m", api: "900h" },
    { display: "1500m", api: "850h" },
    { display: "3000m", api: "700h" },
    { display: "4200m", api: "600h" },
  ];
  const models = ["icon-eu", "ecmwf", "gfs", "icon"];
  const [levelIndex, setLevelIndex] = useState(0);
  const [modelIndex, setModelIndex] = useState(0);

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLevelIndex(parseInt(event.target.value, 10));
  };

  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setModelIndex(parseInt(event.target.value, 10));
  };

  const level = levelMapping[levelIndex].api;
  const model = models[modelIndex];

  return (
    <div className="p-4 w-full h-screen min-h-[500px]">
      <h2 className="text-xl font-semibold mb-2">Windy Widget</h2>
      <div className="flex flex-col gap-2 flex-1 h-[calc(100vh-6rem)]">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex flex-col items-center h-full">
            <input
              id="level-slider"
              type="range"
              min="0"
              max={levelMapping.length - 1}
              value={levelIndex}
              onChange={handleLevelChange}
              className="h-full w-2 [-webkit-appearance:slider-vertical] [writing-mode:bt-lr]"
            />
            <label htmlFor="level-slider" className="mt-2 text-center">
              Elevation:
              <br />
              {levelMapping[levelIndex].display}
            </label>
          </div>
          <div className="flex flex-col gap-2 flex-grow h-full">
            <iframe
              className="w-full flex-1"
              src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=8&overlay=wind&product=${model}&level=${level}&lat=${lat}&lon=${long}`}
            ></iframe>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full bg-gray-100 p-1 rounded-lg">
                {models.map((m, index) => (
                  <button
                    key={m}
                    onClick={() => setModelIndex(index)}
                    className={`flex-1 py-2 px-3 rounded-md transition-all ${
                      modelIndex === index
                        ? "bg-white shadow-sm font-medium"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WindyWidget;
