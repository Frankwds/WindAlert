import { WeatherDataPointYr1h, WeatherDataYr } from '@/lib/yr/types';
import { ForecastCache1hr } from '@/lib/supabase/types';

/**
 * Extracts the local hour (0-23) from a UTC ISO string for a given timezone
 */
function getLocalHour(utcTime: string, timezone: string): number {
  const utcDate = new Date(utcTime);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  return parseInt(formatter.format(utcDate), 10);
}

export function getSixHourSymbolsByDay(yrdata: WeatherDataYr, timezone: string = 'Europe/Oslo') {
  const sixHourSymbolsByDay: Record<string, string[]> = {};

  const yrdataGroupedByDay = yrdata.weatherDataYrHourly.reduce(
    (acc, hour) => {
      const utcDate = new Date(hour.time);
      const formatter = new Intl.DateTimeFormat('nb-NO', {
        timeZone: timezone,
        weekday: 'long',
      });
      const day = formatter.format(utcDate).toLowerCase();

      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(hour);
      return acc;
    },
    {} as Record<string, WeatherDataPointYr1h[]>
  );

  Object.entries(yrdataGroupedByDay).forEach(([day, hours]) => {
    if (!sixHourSymbolsByDay[day]) {
      sixHourSymbolsByDay[day] = [];
    }
    if (hours.length <= 1) {
      return;
    }
    // Check if day has begun (first hour is not 00:00)
    const firstHourLocal = getLocalHour(hours[0].time, timezone);
    const hoursFromLastSixHourlyDataPoint = hours.length % 6;
    if ((firstHourLocal !== 0 && hoursFromLastSixHourlyDataPoint > 4) || hours.length <= 4) {
      // day has begun and is more than 2 hours till next six hourly data point
      sixHourSymbolsByDay[day].push(hours[1].next_6_hours_symbol_code);
    }
    hours.forEach(hour => {
      const localHour = getLocalHour(hour.time, timezone);
      if (localHour === 0) {
        // first hour of the night
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
      if (localHour === 6) {
        // first hour of the morning
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
      if (localHour === 12) {
        // first hour of the day
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
      if (localHour === 18 && hours.length > 7) {
        // first hour of the afternoon && has more than 7 hours left
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
    });
  });

  // For the far future, yr does not give hourly data, so we must use the six hourly data point instead here.
  yrdata.weatherDataYrSixHourly.slice(0, 6).forEach(hour => {
    const utcDate = new Date(hour.time);
    const formatter = new Intl.DateTimeFormat('nb-NO', {
      timeZone: timezone,
      weekday: 'long',
    });
    const day = formatter.format(utcDate).toLowerCase();

    if (!sixHourSymbolsByDay[day]) {
      sixHourSymbolsByDay[day] = [];
    }
    if (hour.symbol_code && sixHourSymbolsByDay[day].length < 4) {
      sixHourSymbolsByDay[day].push(hour.symbol_code);
    }
  });
  return sixHourSymbolsByDay;
}

export function groupForecastByDay(forecast: ForecastCache1hr[], timezone: string = 'Europe/Oslo') {
  const groupedByDay = forecast.reduce(
    (acc, hour) => {
      const utcDate = new Date(hour.time);
      const formatter = new Intl.DateTimeFormat('nb-NO', {
        timeZone: timezone,
        weekday: 'long',
      });
      const day = formatter.format(utcDate).toLowerCase();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(hour);
      return acc;
    },
    {} as Record<string, ForecastCache1hr[]>
  );

  if (Object.keys(groupedByDay).length > 0) {
    const lastDayIndex = Object.keys(groupedByDay).length - 1;
    const lastDay = Object.keys(groupedByDay)[lastDayIndex];
    if (groupedByDay[lastDay].length < 3) {
      delete groupedByDay[lastDay];
    }
  }

  return groupedByDay;
}
