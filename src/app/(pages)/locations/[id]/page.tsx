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
    { label: "n", value: location.n },
    { label: "ne", value: location.ne },
    { label: "e", value: location.e },
    { label: "se", value: location.se },
    { label: "s", value: location.s },
    { label: "sw", value: location.sw },
    { label: "w", value: location.w },
    { label: "nw", value: location.nw },
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
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-4">{location.name}</h1>
        <div className="w-32 h-32 md:w-48 md:h-48 self-center mb-4  float-right">
          <WindCompass allowedDirections={windDirections} />
        </div>
        <div className="break-words break-long">
          {location.description}
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
