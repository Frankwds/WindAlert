"use client";

import Collapsible from "@/app/components/Collapsible";
import WeatherCard from "@/app/components/WeatherCard";
import HourlyWeatherDetails from "@/app/components/HourlyWeatherDetails";
import FailureCard from "@/app/components/FailureCard";
import WarningCard from "@/app/components/WarningCard";
import { DEFAULT_ALERT_RULE } from "../api/cron/mockdata/alert-rules";
import { ForecastCache1hr, ParaglidingLocation } from "@/lib/supabase/types";
import { locationToWindDirectionSymbols } from "@/lib/utils/getWindDirection";
import { isGoodParaglidingCondition } from "../api/cron/_lib/validate/validateDataPoint";

interface Props {
  location: ParaglidingLocation;
  forecast: ForecastCache1hr[];
}

export function groupByDay(data: ForecastCache1hr[]): Record<string, ForecastCache1hr[]> {
  return data.reduce((acc, dp) => {
    // Parse the formatted date string "8/31/25, 12:00 PM" to extract just the date
    const date = new Date(dp.time).toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(dp);
    return acc;
  }, {} as Record<string, ForecastCache1hr[]>);
}


export default function LocationAlertRules({ location, forecast }: Props) {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  // Get all alert rules for this location. there is only one for now
  const locationAlertRules = DEFAULT_ALERT_RULE;

  const validatedForecastData: ForecastCache1hr[] = forecast.map((hour) => {
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

  // Group forecast data by day
  const groupedData = groupByDay(validatedForecastData);

  const positiveDays = Object.values(groupedData)
    .filter((day) => day.some((dp) => dp.is_promising === true))
    .map((day) =>
      new Date(day[0].time).toLocaleDateString("nb-NO", { weekday: "short" })
    );

  const title =
    positiveDays.length > 0
      ? `${locationAlertRules.alert_name} - ${positiveDays.join(", ")}`
      : locationAlertRules.alert_name;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
        Hva menes med lovende?
      </h2>
      <div>
        <Collapsible
          key={locationAlertRules.alert_name}
          title={title}
          className={`${Object.values(groupedData).some((day) => day.some((dp) => dp.is_promising === true)) === true
            ? "bg-[var(--success)]/30 border-l-4 border-[var(--success)]"
            : "bg-[var(--error)]/30 border-l-4 border-[var(--error)]"
            } rounded-lg shadow-[var(--shadow-sm)] mb-2`}
        >
          {Object.values(groupedData).map((day) => (
            <Collapsible
              key={day[0].time}
              title={`${new Date(day[0].time).toLocaleDateString("nb-NO", {
                weekday: "long",
              })}`}
              className={`${day.some((dp) => dp.is_promising === true)
                ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/50"
                : "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/50"
                } rounded-md shadow-sm my-1`}
            >
              {day.map((hour, index) => (
                <Collapsible
                  key={index}
                  title={<WeatherCard hour={hour} compact={true} />}
                  className={`${hour.is_promising
                    ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/30"
                    : "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/30"
                    } rounded-md shadow-[var(--shadow-sm)] my-1`}
                >
                  <div>
                    {!hour.is_promising && hour.validation_failures && (
                      <FailureCard failuresCsv={hour.validation_failures} />
                    )}
                    {hour.validation_warnings && hour.validation_warnings.length > 0 && (
                      <WarningCard warningsCsv={hour.validation_warnings} />
                    )}
                    <HourlyWeatherDetails hour={hour} windDirections={locationToWindDirectionSymbols(location)} altitude={location.altitude} />
                  </div>
                </Collapsible>
              ))}
            </Collapsible>
          ))}
        </Collapsible>
      </div>
    </div>
  );
}
