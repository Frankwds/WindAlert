import { API_URL_CONFIG } from "@/lib/api";
import { ALERT_RULES } from "@/app/api/cron/mockdata/alert-rules";
import { notFound } from "next/navigation";
import { mapYrData } from "@/lib/yr/mapping";
import { WeatherDataYr } from "@/lib/yr/types";

async function getYrData(
  latitude: number,
  longitude: number
): Promise<WeatherDataYr> {
  const { baseURL } = API_URL_CONFIG.yr;
  const url = new URL(baseURL);

  const response = await fetch(`${url}?lat=${latitude}&lon=${longitude}`, {
    headers: {
      "User-Agent": "WindAlert/1.0 github.com/frankwds/windalert",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch YR data");
  }

  const data = await response.json();
  return data;
}

export default async function LocationPage({
  params,
}: {
  params: { id: string };
}) {
  const id = await params.id;
  const location = ALERT_RULES.find((rule) => rule.id === parseInt(id));

  if (!location) {
    notFound();
  }

  const weatherData = await getYrData(location.lat, location.long);
  const mappedData = mapYrData(weatherData);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{location.locationName}</h1>
      <div className="mb-4">
        <p>Latitude: {location.lat}°</p>
        <p>Longitude: {location.long}°</p>
        <p>Allowed wind directions: {location.WIND_DIRECTIONS.join(", ")}</p>
      </div>
      <h2 className="text-xl font-bold mb-2">Weather Data from YR</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(mappedData, null, 2)}
      </pre>
    </div>
  );
}
