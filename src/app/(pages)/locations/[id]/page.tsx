import { notFound } from "next/navigation";
import WeatherTable from "@/app/components/WeatherTable";
import GoogleMaps from "@/app/components/GoogleMapsStatic";
import WindyWidget from "@/app/components/windyWidget";
import LocationHeader from "@/app/components/LocationHeader";
import { ParaglidingLocationService } from "@/lib/supabase/paraglidingLocations";
import { fetchMeteoData } from "@/lib/openMeteo/apiClient";
import { openMeteoResponseSchema } from "@/lib/openMeteo/zod";
import { mapOpenMeteoData } from "@/lib/openMeteo/mapping";
import { combineDataSources } from "@/app/api/cron/_lib/utils/combineData";
import { fetchYrData } from "@/lib/yr/apiClient";
import { mapYrData } from "@/lib/yr/mapping";
import { locationToWindDirectionSymbols } from "@/lib/utils/getWindDirection";
import { DEFAULT_ALERT_RULE } from "@/app/api/cron/mockdata/alert-rules";
import { isGoodParaglidingCondition } from "@/app/api/cron/_lib/validate/validateDataPoint";
import { getSixHourSymbolsByDay } from "../utils/utils";
import { groupForecastByDay } from "../utils/utils";

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

  const combinedData = combineDataSources(meteoData, mappedYrTakeoffData.weatherDataYrHourly);

  const cutoff = Date.now() - 60 * 60 * 1000; // include previous hour
  const filteredForecast = combinedData.filter((f) => new Date(f.time).getTime() >= cutoff);

  // Add validation data to forecast
  const validatedForecast = filteredForecast.map((hour) => {
    const { isGood, validation_failures, validation_warnings } = isGoodParaglidingCondition(
      hour,
      DEFAULT_ALERT_RULE,
      locationToWindDirectionSymbols(location)
    );
    return {
      ...hour,
      location_id: location.id,
      is_promising: isGood,
      validation_failures,
      validation_warnings,
    };
  });

  const sixHourSymbolsByDay = getSixHourSymbolsByDay(mappedYrTakeoffData);
  const groupedByDay = groupForecastByDay(validatedForecast);

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

      <WeatherTable
        groupedByDay={groupedByDay}
        sixHourSymbolsByDay={sixHourSymbolsByDay}
        location={location}
        showValidation={true}
      />

      <WindyWidget lat={location.latitude} long={location.longitude} />
      <GoogleMaps latitude={location.latitude} longitude={location.longitude} />

    </div>
  );
}
