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
    return <div className="text-[var(--foreground)]">Loading alert rules validation...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Alert Rules</h2>
      <div>
        {validationResults.map((rule) => {
          // Extract positive days for this rule
          const positiveDays = rule.dailyData
            .filter(day => day.result === 'positive')
            .map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }));

          // Create title with positive days if any
          const title = positiveDays.length > 0
            ? `${rule.alert_name} - ${positiveDays.join(', ')}`
            : rule.alert_name;

          return (
            <Collapsible
              key={rule.alert_name}
              title={title}
              className={`${rule.result === "positive"
                ? "bg-[var(--success)]/30 border-l-4 border-[var(--success)]"
                : "bg-[var(--error)]/30 border-l-4 border-[var(--error)]"
                } rounded-lg shadow-[var(--shadow-sm)] mb-2`}
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
                  className={`${day.result === "positive"
                    ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/50"
                    : "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/50"
                    } rounded-md shadow-sm my-1`}
                >

                  {day.hourlyData.map((hour, index) => (
                    <Collapsible
                      key={index}
                      title={<WeatherCard hour={hour} compact={true} />}
                      className={`${hour.isGood
                        ? "bg-[var(--success)]/10 border-l-4 border-[var(--success)]/30"
                        : "bg-[var(--error)]/10 border-l-4 border-[var(--error)]/30"
                        } rounded-md shadow-[var(--shadow-sm)] my-1`}

                    >
                      <div>
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
          );
        })}
      </div>
    </div>
  );
}
