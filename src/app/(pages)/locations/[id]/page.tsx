"use client";

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
import { useEffect, useState } from "react";
import SectionButton from "@/app/components/SectionButton";
import SectionModal from "@/app/components/SectionModal";

interface Props {
  params: { id: string };
}

export default function LocationPage({ params }: Props) {
  const [location, setLocation] = useState<any>(null);
  const [futureForecast, setFutureForecast] = useState<any[]>([]);
  const [mappedYrTakeoffData, setMappedYrTakeoffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const locationId = params.id;
      const loc = await ParaglidingLocationService.getById(locationId);

      if (!loc) {
        notFound();
      }
      setLocation(loc);

      const forecastData = await fetchMeteoData(loc.latitude, loc.longitude);
      const validatedData = openMeteoResponseSchema.parse(forecastData);
      const meteoData = mapOpenMeteoData(validatedData);

      const yrTakeoffData = await fetchYrData(loc.latitude, loc.longitude);
      const mappedYrDataResult = mapYrData(yrTakeoffData);
      setMappedYrTakeoffData(mappedYrDataResult);

      const combinedData = combineDataSources(
        meteoData,
        mappedYrDataResult.weatherDataYrHourly,
        "Europe/Oslo"
      );

      const currentTime = new Date();
      const firstFutureIndex = combinedData.findIndex((forecast) => {
        const forecastTime = new Date(forecast.time);
        return forecastTime.getHours() >= currentTime.getHours();
      });

      const future =
        firstFutureIndex !== -1 ? combinedData.slice(firstFutureIndex) : [];
      setFutureForecast(future);
      setLoading(false);
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!location) {
    return null;
  }

  return (
    <div className="py-4">
      <LocationHeader
        name={location.name}
        description={location.description || ""}
        windDirections={locationToWindDirectionSymbols(location)}
        locationId={location.id}
        latitude={location.latitude}
        longitude={location.longitude}
        flightlog_id={location.flightlog_id}
      />
      <div className="px-4">
        <SectionButton
          title="Google Maps"
          onClick={() => setOpenSection("google-maps")}
        />
        <SectionButton
          title="YR Weather"
          onClick={() => setOpenSection("yr-weather")}
        />
        <SectionButton title="Windy" onClick={() => setOpenSection("windy")} />
      </div>

      {openSection && (
        <SectionModal
          title={
            openSection === "google-maps"
              ? "Google Maps"
              : openSection === "yr-weather"
              ? "YR Weather"
              : "Windy"
          }
          onClose={() => setOpenSection(null)}
        >
          {openSection === "google-maps" && (
            <GoogleMaps
              latitude={location.latitude}
              longitude={location.longitude}
            />
          )}
          {openSection === "yr-weather" && mappedYrTakeoffData && (
            <HourlyWeather
              forecast={futureForecast}
              yrdata={mappedYrTakeoffData}
              lat={location.latitude}
              long={location.longitude}
            />
          )}
          {openSection === "windy" && (
            <WindyWidget
              lat={location.latitude}
              long={location.longitude}
            />
          )}
        </SectionModal>
      )}
      <LocationAlertRules location={location} forecast={futureForecast} />
    </div>
  );
}
