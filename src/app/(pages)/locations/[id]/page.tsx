"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import WeatherTable from "@/app/components/LocationPage/WeatherTable";
import GoogleMaps from "@/app/components/LocationPage/GoogleMapsStatic";
import WindyWidget from "@/app/components/LocationPage/windyWidget";
import LocationHeader from "@/app/components/LocationPage/LocationHeader";
import { Contribute } from "@/app/components/LocationPage/Contribute/Contribute";
import { ParaglidingLocationService } from "@/lib/supabase/paraglidingLocations";
import { fetchMeteoDataClient } from "@/lib/openMeteo/apiClient";
import { openMeteoResponseSchema } from "@/lib/openMeteo/zod";
import { mapOpenMeteoData } from "@/lib/openMeteo/mapping";
import { combineDataSources } from "@/app/api/cron/_lib/utils/combineData";
import { fetchYrDataClient } from "@/lib/yr/apiClient";
import { mapYrData } from "@/lib/yr/mapping";
import { locationToWindDirectionSymbols } from "@/lib/utils/getWindDirection";
import { DEFAULT_ALERT_RULE } from "@/app/api/cron/_lib/validate/alert-rules";
import { isGoodParaglidingCondition } from "@/app/api/cron/_lib/validate/validateDataPoint";
import { getSixHourSymbolsByDay } from "../utils/utils";
import { groupForecastByDay } from "../utils/utils";
import { LoadingSpinner } from "@/app/components/shared";
import { ParaglidingLocation } from "@/lib/supabase/types";
import { ForecastCache1hr } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function LocationPage({ params }: Props) {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [location, setLocation] = useState<ParaglidingLocation | null>(null);
  const [groupedByDay, setGroupedByDay] = useState<Record<string, ForecastCache1hr[]>>({});
  const [sixHourSymbolsByDay, setSixHourSymbolsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = (await params).id;
        setLocationId(id);

        const locationData = await ParaglidingLocationService.getById(id);
        if (!locationData) {
          notFound();
        }
        setLocation(locationData);

        // Fetch weather data
        const forecastData = await fetchMeteoDataClient(locationData.latitude, locationData.longitude);
        const validatedData = openMeteoResponseSchema.parse(forecastData);
        const meteoData = mapOpenMeteoData(validatedData);

        const yrTakeoffData = await fetchYrDataClient(locationData.latitude, locationData.longitude);
        const mappedYrTakeoffData = mapYrData(yrTakeoffData);

        const combinedData = combineDataSources(meteoData, mappedYrTakeoffData.weatherDataYrHourly);

        const cutoff = Date.now() - 60 * 60 * 1000; // include previous hour
        const filteredForecast = combinedData.filter((f) => new Date(f.time).getTime() >= cutoff);

        // Add validation data to forecast
        const validatedForecast = filteredForecast.map((hour) => {
          const { isGood, validation_failures, validation_warnings } = isGoodParaglidingCondition(
            hour,
            DEFAULT_ALERT_RULE,
            locationToWindDirectionSymbols(locationData)
          );
          return {
            ...hour,
            location_id: locationData.id,
            is_promising: isGood,
            validation_failures,
            validation_warnings,
          };
        });

        const sixHourSymbols = getSixHourSymbolsByDay(mappedYrTakeoffData);
        const grouped = groupForecastByDay(validatedForecast);

        setSixHourSymbolsByDay(sixHourSymbols);
        setGroupedByDay(grouped);
      } catch (err) {
        console.error("Error loading location data:", err);
        setError(err instanceof Error ? err.message : "Failed to load location data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params]);

  if (loading) {
    return (
      <div className="py-4 flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 flex justify-center items-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Location</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="py-4 flex justify-center items-center min-h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Location Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <LocationHeader
        name={location.name}
        description={location.description || ""}
        windDirections={locationToWindDirectionSymbols(location)}
        locationId={locationId!}
        latitude={location.latitude}
        longitude={location.longitude}
        altitude={location.altitude}
        flightlog_id={location.flightlog_id}
        isMain={location.is_main}
      />

      <WeatherTable
        groupedByDay={groupedByDay}
        sixHourSymbolsByDay={sixHourSymbolsByDay}
        location={location}
        showValidation={true}
      />

      <WindyWidget lat={location.latitude} long={location.longitude} />
      <GoogleMaps latitude={location.latitude} longitude={location.longitude}
        landing_latitude={location.landing_latitude} landing_longitude={location.landing_longitude} />

      <Contribute
        locationId={location.id}
        latitude={location.latitude}
        longitude={location.longitude}
        landingLatitude={location.landing_latitude}
        landingLongitude={location.landing_longitude}
        landingAltitude={location.landing_altitude}
        onSave={(landingLat, landingLng, landingAltitude) => {
          // Optional callback for additional handling after save
          console.log('Landing coordinates saved:', { landingLat, landingLng, landingAltitude });
        }}
      />

    </div>
  );
}
