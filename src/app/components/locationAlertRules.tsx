"use client";

import { validateWeather } from "@/app/api/cron/_lib/validate/validateRule";
import Collapsible from "@/app/components/Collapsible";
import WeatherCard from "@/app/components/WeatherCard";
import HourlyWeatherDetails from "@/app/components/HourlyWeatherDetails";
import { Location } from "@/lib/common/types/location";
import FailureCard from "@/app/components/FailureCard";
import WarningCard from "@/app/components/WarningCard";
import { DEFAULT_ALERT_RULE } from "../api/cron/mockdata/alert-rules";
import { ForecastCache1hr } from "@/lib/supabase/types";
import { groupByDay } from "../api/cron/_lib/utils/groupData";

interface Props {
  location: Location;
  forecast: ForecastCache1hr[];
}

export default function LocationAlertRules({ location, forecast }: Props) {
  if (!forecast || forecast.length === 0) {
    return null;
  }

  // Get all alert rules for this location. there is only one for now
  const locationAlertRules = DEFAULT_ALERT_RULE;

  // Group forecast data by day
  const groupedData = groupByDay(forecast);

  // Validate each alert rule
  const { overallResult, dailyData } = validateWeather(
    groupedData,
    locationAlertRules,
    location
  );

  const validationResult = {
    alert_name: locationAlertRules.alert_name || `Rule ${locationAlertRules.id}`,
    locationName: location.name,
    result: overallResult,
    dailyData: dailyData,
    lat: location.lat,
    long: location.long,
    elevation: location.elevation,
  };

  const positiveDays = validationResult.dailyData
    .filter((day) => day.result === "positive")
    .map((day) =>
      new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })
    );

  const title =
    positiveDays.length > 0
      ? `${validationResult.alert_name} - ${positiveDays.join(", ")}`
      : validationResult.alert_name;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">
        Alert Rules
      </h2>
      <div>
        <Collapsible
          key={validationResult.alert_name}
          title={title}
          className={`${validationResult.result === "positive"
            ? "bg-[var(--success)]/30 border-l-4 border-[var(--success)]"
            : "bg-[var(--error)]/30 border-l-4 border-[var(--error)]"
            } rounded-lg shadow-[var(--shadow-sm)] mb-2`}
        >
          {validationResult.dailyData.map((day) => (
            <Collapsible
              key={day.date}
              title={`${new Date(day.date).toLocaleDateString("en-US", {
                weekday: "long",
              })}${day.positiveIntervals.length > 0
                ? ` - ${day.positiveIntervals
                  .map((interval) => `${interval.start}-${interval.end}`)
                  .join(", ")}`
                : ""
                }`}
              className={`${day.result === "positive"
                ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/50"
                : "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/50"
                } rounded-md shadow-sm my-1`}
            >
              {day.hourlyData.map((hour, index) => (
                <Collapsible
                  key={index}
                  title={<WeatherCard hour={hour} compact={true} timeZone={location.timezone} />}
                  className={`${hour.isGood
                    ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/30"
                    : "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/30"
                    } rounded-md shadow-[var(--shadow-sm)] my-1`}
                >
                  <div>
                    {!hour.isGood && hour.failures && (
                      <FailureCard failures={hour.failures} />
                    )}
                    {hour.warnings && hour.warnings.length > 0 && (
                      <WarningCard warnings={hour.warnings} />
                    )}
                    <HourlyWeatherDetails hour={hour} />
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
