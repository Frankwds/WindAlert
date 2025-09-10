import { notFound } from "next/navigation";
import HourlyWeather from "@/app/components/hourlyWeather";
import GoogleMaps from "@/app/components/GoogleMapsStatic";
import WindyWidget from "@/app/components/windyWidget";
import LocationAlertRules from "@/app/components/locationAlertRules";
import LocationHeader from "@/app/components/LocationHeader";
import { ParaglidingLocationService } from "@/lib/supabase/paraglidingLocations";
import { fetchMeteoData } from "@/lib/openMeteo/apiClient";
import { openMeteoResponseSchema } from "@/lib/openMeteo/zod";
import { mapOpenMeteoData } from "@/lib/openMeteo/mapping";
import { combineDataSources } from "@/app/api/cron/_lib/utils/combineData";
import { fetchYrData } from "@/lib/yr/apiClient";
import { mapYrData } from "@/lib/yr/mapping";
import { locationToWindDirectionSymbols } from "@/lib/utils/getWindDirection";
interface Props {
  params: Promise<{ id: string }>;
}

export default async function LocationPage({ params }: Props) {
  const locationId = (await params).id;
  const location = await ParaglidingLocationService.getById(locationId);

  if (!location) {
    notFound();
  }
  const forecastData = await fetchMeteoData(location.latitude, location.longitude);
  const validatedData = openMeteoResponseSchema.parse(forecastData);
  const meteoData = mapOpenMeteoData(validatedData);

  const yrTakeoffData = await fetchYrData(location.latitude, location.longitude);
  const mappedYrTakeoffData = mapYrData(yrTakeoffData);

  const combinedData = combineDataSources(meteoData, mappedYrTakeoffData.weatherDataYrHourly, 'Europe/Oslo');

  // Filter to future hours on the server to avoid hydration mismatches
  const cutoff = Date.now() - 60 * 60 * 1000; // include previous hour
  const filteredForecast = combinedData.filter((f) => new Date(f.time).getTime() >= cutoff);
  const visibleForecast = filteredForecast.length > 0 ? filteredForecast : combinedData;

  return (
    <div className="py-4">
      <LocationHeader
        name={location.name}
        description={location.description || ""}
        windDirections={locationToWindDirectionSymbols(location)}
        locationId={locationId}
        latitude={location.latitude}
        longitude={location.longitude}
        altitude={location.altitude}
        flightlog_id={location.flightlog_id}
      />
      <GoogleMaps latitude={location.latitude} longitude={location.longitude} />
      <HourlyWeather
        forecast={visibleForecast}
        yrdata={mappedYrTakeoffData}
        lat={location.latitude}
        long={location.longitude}
        windDirections={locationToWindDirectionSymbols(location)}
        altitude={location.altitude}
      />
      <WindyWidget lat={location.latitude} long={location.longitude} />
      <LocationAlertRules location={location} forecast={visibleForecast} />
    </div>
  );
}
