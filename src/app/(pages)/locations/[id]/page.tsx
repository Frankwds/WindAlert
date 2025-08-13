import { ALERT_RULES } from "@/app/api/cron/mockdata/alert-rules";
import { notFound } from "next/navigation";
import { mapYrData } from "@/lib/yr/mapping";
import { fetchYrData } from "@/lib/yr/apiClient";
import HourlyWeather from "@/app/components/hourlyWeather";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LocationPage({ params }: Props) {
  const locationId = (await params).id;
  const location = ALERT_RULES.find((rule) => rule.id === parseInt(locationId));

  if (!location) {
    notFound();
  }

  const weatherData = await fetchYrData(location.lat, location.long);
  const mappedData = mapYrData(weatherData);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{location.locationName}</h1>
      <div className="mb-4">
        <p>Latitude: {location.lat}°</p>
        <p>Longitude: {location.long}°</p>
        <p>Allowed wind directions: {location.WIND_DIRECTIONS.join(", ")}</p>
      </div>
      <HourlyWeather weatherData={mappedData.weatherDataYr1h} />
    </div>
  );
}
