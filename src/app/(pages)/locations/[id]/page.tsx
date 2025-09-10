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
import { WeatherDataPointYr1h, WeatherDataYr } from "@/lib/yr/types";
import { ForecastCache1hr } from "@/lib/supabase/types";
import { DEFAULT_ALERT_RULE } from "@/app/api/cron/mockdata/alert-rules";
import { isGoodParaglidingCondition } from "@/app/api/cron/_lib/validate/validateDataPoint";

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

  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const sixHourSymbolsByDay = getSixHourSymbolsByDay(mappedYrTakeoffData, dayNames);
  const groupedByDay = groupForecastByDay(validatedForecast, dayNames);

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
      <WeatherTable
        groupedByDay={groupedByDay}
        sixHourSymbolsByDay={sixHourSymbolsByDay}
        lat={location.latitude}
        long={location.longitude}
        windDirections={locationToWindDirectionSymbols(location)}
        altitude={location.altitude}
        showValidation={false}
      />
      <WindyWidget lat={location.latitude} long={location.longitude} />
      <WeatherTable
        groupedByDay={groupedByDay}
        sixHourSymbolsByDay={sixHourSymbolsByDay}
        lat={location.latitude}
        long={location.longitude}
        windDirections={locationToWindDirectionSymbols(location)}
        altitude={location.altitude}
        showValidation={true}
      />
    </div>
  );
}

function getSixHourSymbolsByDay(yrdata: WeatherDataYr, dayNames: string[]) {
  const sixHourSymbolsByDay: Record<string, string[]> = {};

  const yrdataGroupedByDay = yrdata.weatherDataYrHourly.reduce((acc, hour) => {
    const dayIndex = new Date(hour.time).getDay();
    const day = dayNames[dayIndex];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(hour);
    return acc;
  }, {} as Record<string, WeatherDataPointYr1h[]>);

  Object.entries(yrdataGroupedByDay)
    .forEach(([day, hours]) => {
      if (!sixHourSymbolsByDay[day]) {
        sixHourSymbolsByDay[day] = [];
      }
      hours
        .forEach((hour, index) => {
          if (index === 0) {
            sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
            return;
          }
          if (index === hours.length - 1 && hours.length > 6 && sixHourSymbolsByDay[day].length < 4) {
            sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
            return;
          }
          if (index % 6 === 0) {
            sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
            return;
          }
        })
    });

  yrdata.weatherDataYrSixHourly.slice(0, 6)
    .forEach((hour) => {
      const dayIndex = new Date(hour.time).getDay();
      const day = dayNames[dayIndex];
      if (!sixHourSymbolsByDay[day]) {
        sixHourSymbolsByDay[day] = [];
      }
      if (hour.symbol_code && sixHourSymbolsByDay[day].length < 4) {
        sixHourSymbolsByDay[day].push(hour.symbol_code);
      }
    });
  return sixHourSymbolsByDay;
}

function groupForecastByDay(forecast: ForecastCache1hr[], dayNames: string[]) {
  const groupedByDay = forecast.reduce((acc, hour) => {

    const utcDate = new Date(hour.time);
    const localDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "Europe/Oslo" }));
    const dayIndex = localDate.getDay();
    const day = dayNames[dayIndex];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(hour);
    return acc;
  }, {} as Record<string, ForecastCache1hr[]>);


  if (Object.keys(groupedByDay).length > 0) {
    const lastDayIndex = Object.keys(groupedByDay).length - 1;
    const lastDay = Object.keys(groupedByDay)[lastDayIndex];
    if (groupedByDay[lastDay].length < 3) {
      delete groupedByDay[lastDay];
    }
  }

  return groupedByDay;
}
