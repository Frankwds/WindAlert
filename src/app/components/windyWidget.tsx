"use client";

import { useState, useEffect, useRef } from "react";

interface WindyWidgetProps {
  lat: number;
  long: number;
}

declare global {
  interface Window {
    windyInit: any;
    L: any;
  }
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
  const windyApiRef = useRef<any>(null);

  useEffect(() => {
    const WINDY_API_KEY = process.env.NEXT_PUBLIC_WINDY_API_KEY;

    if (!WINDY_API_KEY) {
      console.log(process.env);
      console.error("Windy API key is not set in .env.local");
      return;
    }

    const loadScript = (src: string, onLoad: () => void) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = onLoad;
      document.body.appendChild(script);
    };

    loadScript("https://unpkg.com/leaflet@1.4.0/dist/leaflet.js", () => {
      loadScript("https://api.windy.com/assets/map-forecast/libBoot.js", () => {
        const options = {
          key: WINDY_API_KEY,
          lat: lat,
          lon: long,
          zoom: 5,
        };

        window.windyInit(options, (windyAPI: any) => {
          windyApiRef.current = windyAPI;
        });
      });
    });

    return () => {
      // Cleanup scripts if component unmounts
      const scripts = document.querySelectorAll<HTMLScriptElement>(
        'script[src^="https://"]'
      );
      scripts.forEach((script) => {
        if (
          script.src.includes("leaflet") ||
          script.src.includes("windy.com")
        ) {
          script.remove();
        }
      });
    };
  }, [lat, long]);

  const handleLevelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = levelMapping[parseInt(event.target.value, 10)].api;
    setLevelIndex(parseInt(event.target.value, 10));
    if (windyApiRef.current) {
      windyApiRef.current.store.set("level", newLevel);
    }
  };

  const handleModelChange = (index: number) => {
    const newModel = models[index];
    setModelIndex(index);
    if (windyApiRef.current) {
      windyApiRef.current.store.set("product", newModel);
    }
  };

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
            <div id="windy" className="w-full flex-1"></div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full bg-gray-100 p-1 rounded-lg">
                {models.map((m, index) => (
                  <button
                    key={m}
                    onClick={() => handleModelChange(index)}
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
