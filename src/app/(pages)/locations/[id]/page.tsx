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


  // Slice forecast data to only future hours based on the current time
  const currentTime = new Date();
  const firstFutureIndex = combinedData.findIndex((forecast) => {
    const forecastTime = new Date(forecast.time);
    return forecastTime.getHours() >= currentTime.getHours();
  });

  const futureForecast = firstFutureIndex !== -1
    ? combinedData.slice(firstFutureIndex)
    : [];

  return (
    <div className="py-4">
      <LocationHeader
        name={location.name}
        description={location.description || ""}
        windDirections={locationToWindDirectionSymbols(location)}
        locationId={locationId}
      />
      <GoogleMaps latitude={location.latitude} longitude={location.longitude} />
      <HourlyWeather
        forecast={futureForecast}
        lat={location.latitude}
        long={location.longitude}
      />
      <WindyWidget lat={location.latitude} long={location.longitude} />
      <LocationAlertRules location={location} forecast={futureForecast} />
    </div>
  );
}
