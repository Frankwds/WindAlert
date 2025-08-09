"use client";

import { useEffect, useState } from "react";

interface MeteogramProps {
  lat: number;
  long: number;
  locationName: string;
}

export default function Meteogram({
  lat,
  long,
  locationName,
}: MeteogramProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeteogram() {
      try {
        const url = `/api/meteogram?lat=${lat}&long=${long}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch meteogram: ${res.statusText}`);
        }
        const svg = await res.text();
        const modifiedSvg = svg.replace(
          /Weather forecast for .*/,
          `Forecast for ${locationName}`
        );
        setSvgContent(modifiedSvg);
      } catch (e: any) {
        setError(e.message);
      }
    }

    fetchMeteogram();
  }, [lat, long, locationName]);

  if (error) {
    return <div className="p-4 text-red-500">Error loading meteogram: {error}</div>;
  }

  if (!svgContent) {
    return <div className="p-4">Loading meteogram...</div>;
  }

  return (
    <div
      className="p-4 bg-white"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
