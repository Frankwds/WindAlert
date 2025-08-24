"use client";

import { useState } from "react";
import ExternalLinkIcon from "./ExternalLinkIcon";

interface WindyWidgetProps {
  lat: number;
  long: number;
}

const WindyWidget: React.FC<WindyWidgetProps> = ({ lat, long }) => {
  const models = ["iconEu", "ecmwf", "gfs"];
  const [modelIndex, setModelIndex] = useState(0);
  const [isMapActive, setIsMapActive] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<"wind" | "gust" | "ccl">("gust");

  const level = "surface";
  const model = models[modelIndex];

  // Windy.com URL with coordinates, current model, and marker
  const windyUrl = `https://www.windy.com/${lat.toFixed(3)}/${long.toFixed(3)}/${model}?${model},${selectedLayer},${lat.toFixed(3)},${long.toFixed(3)},9,p:wind`;

  return (
    <div className="p-4 w-full h-screen min-h-[500px]">
      <div className="flex flex-col gap-2 flex-1 h-[calc(100vh-6rem)]">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex flex-col gap-2 flex-grow h-full">
            <div className="mb-4">
              <a
                href={windyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold mb-2 text-[var(--foreground)] hover:text-[var(--accent)] hover:underline transition-colors duration-200 cursor-pointer inline-flex items-center gap-2"
              >
                Wind Forecast on Windy.com
                <ExternalLinkIcon size={24} className="inline-block" />
              </a>
            </div>
            <div className="relative w-full flex-1">
              <iframe
                className="w-full h-full"
                src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=m/s&zoom=7&overlay=${selectedLayer}&product=${model}&level=${level}&lat=${lat}&lon=${long}&message=true&marker=true&detailLat=${lat}&detailLon=${long}`}
              ></iframe>
              {!isMapActive && (
                <div
                  className="absolute top-0 left-0 w-full h-full"
                  onClick={() => setIsMapActive(true)}
                />
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              {/* Layer Selection Buttons */}
              <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
                {(["wind", "gust", "ccl"] as const).map((layer, index) => (
                  <button
                    key={layer}
                    onClick={() => setSelectedLayer(layer)}
                    className={`flex-1 py-1.5 px-3 transition-all cursor-pointer capitalize ${index === 0 ? "rounded-l-md" : ""
                      } ${index === 2 ? "rounded-r-md" : ""
                      } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
                      } ${selectedLayer === layer
                        ? "bg-[var(--background)] shadow-[var(--shadow-sm)] font-medium"
                        : "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50"
                      }`}
                  >
                    {layer === "ccl" ? "Thermals" : layer}
                  </button>
                ))}
              </div>
              {/* Model Selection Buttons */}
              <div className="flex w-full bg-[var(--border)] p-1 rounded-lg">
                {models.map((m, index) => (
                  <button
                    key={m}
                    onClick={() => setModelIndex(index)}
                    className={`flex-1 py-1.5 px-3 transition-all cursor-pointer ${index === 0 ? "rounded-l-md" : ""
                      } ${index === models.length - 1 ? "rounded-r-md" : ""
                      } ${index > 0 ? "border-l border-[var(--background)]/20" : ""
                      } ${modelIndex === index
                        ? "bg-[var(--background)] shadow-[var(--shadow-sm)] font-medium"
                        : "hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50"
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
