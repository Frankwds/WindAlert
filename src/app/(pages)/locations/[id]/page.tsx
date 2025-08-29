import { notFound } from "next/navigation";
import HourlyWeather from "@/app/components/hourlyWeather";
import WindCompass from "@/app/components/windCompass";
import GoogleMaps from "@/app/components/GoogleMapsStatic";
import WindyWidget from "@/app/components/windyWidget";
import LocationAlertRules from "@/app/components/locationAlertRules";
import { ParaglidingLocationService } from "@/lib/supabase/paraglidingLocations";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LocationPage({ params }: Props) {
  const locationId = (await params).id;
  const location = await ParaglidingLocationService.getById(locationId);

  if (!location) {
    notFound();
  }

  const windDirections = [
    { label: "N", value: location.n },
    { label: "NE", value: location.ne },
    { label: "E", value: location.e },
    { label: "SE", value: location.se },
    { label: "S", value: location.s },
    { label: "SW", value: location.sw },
    { label: "W", value: location.w },
    { label: "NW", value: location.nw },
  ].filter((direction) => direction.value).map((direction) => direction.label);


  const locationForAlerts = {
    id: parseInt(location.id),
    name: location.name,
    lat: location.latitude,
    long: location.longitude,
    elevation: location.altitude,
    timezone: "Europe/Oslo",
    description: location.description || "",
    windDirections: windDirections,
  };

  return (
    <div className="py-4">
      <div className="mb-4 flex flex-col flex-row gap-4 justify-between">
        <div className="flex-grow">
          <h1 className="text-2xl font-bold mb-4">{location.name}</h1>
          <div className="mb-4">
            <p>Latitude: {location.latitude}°</p>
            <p>Longitude: {location.longitude}°</p>
          </div>
          {location.description}
        </div>
        <div className="w-32 h-32 md:w-48 md:h-48 self-center">
          <WindCompass allowedDirections={windDirections} />
        </div>
      </div>
      <GoogleMaps latitude={location.latitude} longitude={location.longitude} />
      <HourlyWeather
        takeoffLat={location.latitude}
        takeoffLong={location.longitude}
        timezone={'Europe/Oslo'}
      />
      <WindyWidget lat={location.latitude} long={location.longitude} />
      <LocationAlertRules location={locationForAlerts} />
    </div>
  );
}
