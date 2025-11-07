import { WeatherDataPointYr1h, WeatherDataYr } from '@/lib/yr/types';
import { ForecastCache1hr } from '@/lib/supabase/types';

export function getSixHourSymbolsByDay(yrdata: WeatherDataYr) {
  const sixHourSymbolsByDay: Record<string, string[]> = {};

  const yrdataGroupedByDay = yrdata.weatherDataYrHourly.reduce(
    (acc, hour) => {
      const utcDate = new Date(hour.time);
      const formatter = new Intl.DateTimeFormat('nb-NO', {
        timeZone: 'Europe/Oslo',
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
    if (!hours[0].time.includes('T21:00:00Z')) {
      // day has begun
      sixHourSymbolsByDay[day].push(hours[1].next_6_hours_symbol_code);
    }
    hours.forEach(hour => {
      if (hour.time.includes('T21:00:00Z')) {
        // first hour of the night
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
      if (hour.time.includes('T03:00:00Z')) {
        // first hour of the morning
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
      if (hour.time.includes('T9:00:00Z')) {
        // first hour of the day
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
      if (hour.time.includes('T15:00:00Z') && hours.length > 7) {
        // first hour of the afternoon && has more than 7 hours left
        sixHourSymbolsByDay[day].push(hour.next_6_hours_symbol_code);
        return;
      }
    });
  });

  yrdata.weatherDataYrSixHourly.slice(0, 6).forEach(hour => {
    const utcDate = new Date(hour.time);
    const formatter = new Intl.DateTimeFormat('nb-NO', {
      timeZone: 'Europe/Oslo',
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

export function groupForecastByDay(forecast: ForecastCache1hr[]) {
  const groupedByDay = forecast.reduce(
    (acc, hour) => {
      const utcDate = new Date(hour.time);
      const formatter = new Intl.DateTimeFormat('nb-NO', {
        timeZone: 'Europe/Oslo',
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
