import { WeatherDataPointYr1h, WeatherDataYr } from "@/lib/yr/types";
import { ForecastCache1hr } from "@/lib/supabase/types";


export function getSixHourSymbolsByDay(yrdata: WeatherDataYr, dayNames: string[]) {
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

export function groupForecastByDay(forecast: ForecastCache1hr[], dayNames: string[]) {
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
