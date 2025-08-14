import { ALERT_RULES } from "@/app/api/cron/mockdata/alert-rules";
import { notFound } from "next/navigation";
import { mapYrData } from "@/lib/yr/mapping";
import { fetchYrData } from "@/lib/yr/apiClient";
import HourlyWeather from "@/app/components/hourlyWeather";
import WindCompass from "@/app/components/windCompass";
import GoogleMaps from "@/app/components/googleMaps";
import WindyWidget from "@/app/components/windyWidget";

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
      <div className="mb-4 flex flex-col flex-row gap-4 justify-between">
        <div className="flex-grow">
          <h1 className="text-2xl font-bold mb-4">{location.locationName}</h1>
          <div className="mb-4">
            <p>Latitude: {location.lat}°</p>
            <p>Longitude: {location.long}°</p>
          </div>
          Description text, lorem ipsum dolor .....
        </div>
        <div className="w-32 h-32 md:w-48 md:h-48 self-center">
          <WindCompass allowedDirections={location.WIND_DIRECTIONS} />
        </div>
      </div>
      <GoogleMaps latitude={location.lat} longitude={location.long} />
      <HourlyWeather
        weatherData={mappedData.weatherDataYr1h}
        timezone="Europe/Oslo"
      />
      <WindyWidget lat={location.lat} long={location.long} />
    </div>
  );
}
