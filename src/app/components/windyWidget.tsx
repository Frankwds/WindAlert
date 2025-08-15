"use client";

import { useState } from "react";

interface WindyWidgetProps {
  lat: number;
  long: number;
}

const WindyWidget: React.FC<WindyWidgetProps> = ({ lat, long }) => {
  const models = ["icon-eu", "ecmwf", "gfs", "icon"];
  const [modelIndex, setModelIndex] = useState(0);
  const [isMapActive, setIsMapActive] = useState(false);

  const level = "surface";
  const model = models[modelIndex];

  return (
    <div className="p-4 w-full h-screen min-h-[500px]">
      <div className="flex flex-col gap-2 flex-1 h-[calc(100vh-6rem)]">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex flex-col gap-2 flex-grow h-full">
            <div className="relative w-full flex-1">
              <iframe
                className="w-full h-full"
                src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=8&overlay=wind&product=${model}&level=${level}&lat=${lat}&lon=${long}&message=true&marker=true&detailLat=${lat}&detailLon=${long}`}
              ></iframe>
              {!isMapActive && (
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  onClick={() => setIsMapActive(true)}
                />
              )}
            </div>
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
