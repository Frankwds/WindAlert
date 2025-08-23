"use client";

import { useEffect, useState } from "react";
import { ALERT_RULES } from "@/app/api/cron/mockdata/alert-rules";
import { LocationResult } from "@/lib/openMeteo/types";
import { getCombinedData } from "@/lib/utils/getCombinedData";
import { validateWeather } from "@/app/api/cron/_lib/validate/validateRule";
import Collapsible from "@/app/components/Collapsible";
import WeatherCard from "@/app/components/WeatherCard";
import HourlyWeatherDetails from "@/app/components/HourlyWeatherDetails";
import { Location } from "@/lib/common/types/location";
import FailureCard from "@/app/components/FailureCard";

interface Props {
  location: Location;
}

export default function LocationAlertRules({ location }: Props) {
  const [validationResults, setValidationResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function validateAlertRules() {
      try {
        // Get all alert rules for this location
        const locationAlertRules = ALERT_RULES.filter(
          (rule) => rule.locationId === location.id
        );

        // Get weather data for the location
        const weatherData = await getCombinedData({
          lat: location.lat,
          long: location.long,
        });

        // Validate each alert rule
        const results = await Promise.all(
          locationAlertRules.map(async (alertRule) => {
            const { overallResult, dailyData } = validateWeather(
              weatherData,
              alertRule,
              location
            );

            return {
              alert_name: alertRule.alert_name || `Rule ${alertRule.id}`,
              locationName: location.name,
              result: overallResult,
              dailyData: dailyData,
              lat: location.lat,
              long: location.long,
              elevation: location.elevation,
            };
          })
        );

        setValidationResults(results);
      } catch (error) {
        console.error("Failed to validate alert rules:", error);
      } finally {
        setIsLoading(false);
      }
    }

    validateAlertRules();
  }, [location]);

  if (isLoading) {
    return <div className="text-white">Loading alert rules validation...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Alert Rules</h2>
      <div>
        {validationResults.map((rule) => (
          <Collapsible
            key={rule.alert_name}
            title={`${rule.alert_name}`}
            className={
              rule.result === "positive" ? "bg-green-900" : "bg-red-900"
            }
          >
            {rule.dailyData.map((day) => (
              <Collapsible
                key={day.date}
                title={`${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}${day.positiveIntervals.length > 0
                  ? ` - ${day.positiveIntervals
                    .map((interval) => `${interval.start}-${interval.end}`)
                    .join(', ')}`
                  : ''
                  }`}
                className={
                  day.result === "positive" ? "bg-green-800" : "bg-red-800"
                }
              >

                {day.hourlyData.map((hour, index) => (
                  <Collapsible
                    key={index}
                    title={<WeatherCard hour={hour} compact={true} />}
                    className={hour.isGood ? "bg-green-700" : "bg-red-700"}

                  >
                    <div className="space-y-4">
                      {!hour.isGood && hour.failures && (
                        <FailureCard failures={hour.failures} />
                      )}
                      <HourlyWeatherDetails hour={hour} />

                    </div>
                  </Collapsible>
                ))}
              </Collapsible>
            ))}
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
