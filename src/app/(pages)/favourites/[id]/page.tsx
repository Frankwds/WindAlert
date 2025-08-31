import { notFound } from "next/navigation";
import HourlyWeather from "@/app/components/hourlyWeather";
import GoogleMaps from "@/app/components/GoogleMapsStatic";
import WindyWidget from "@/app/components/windyWidget";
import LocationAlertRules from "@/app/components/locationAlertRules";
import LocationHeader from "@/app/components/LocationHeader";
import { ForecastCacheService } from "@/lib/supabase/forecastCache";
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

  const forecastData = await ForecastCacheService.getAllByLocation(locationId);

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
      <LocationHeader
        name={location.name}
        description={location.description || ""}
        windDirections={windDirections}
      />
      <GoogleMaps latitude={location.latitude} longitude={location.longitude} />
      <HourlyWeather
        forecast={forecastData}
        timezone={'Europe/Oslo'}
      />
      <WindyWidget lat={location.latitude} long={location.longitude} />
      <LocationAlertRules location={locationForAlerts} forecast={forecastData} />
    </div>
  );
}
