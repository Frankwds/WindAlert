import CollapsibleForAlertDebug from "./components/collapsibleForAlertDebug";
import { LocationResult } from "./api/cron/types";
import HourlyWeatherForAlertDebug from "./components/hourlyWeatherForAlertDebug";

async function getData(): Promise<LocationResult[]> {
  // When fetching on the server, we need to provide the full URL.
  const res = await fetch(`${process.env.API_URL}/api/cron`, {
    cache: "no-store",
  });
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default async function Home() {
  const data = await getData();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Weather Conditions
        </h1>
        <div>
          {data.map((location) => (
            <CollapsibleForAlertDebug
              key={location.locationName}
              title={`${location.locationName} (${location.lat}, ${location.long}, ${location.elevation}m)`}
              className={
                location.result === "positive" ? "bg-green-900" : "bg-red-900"
              }
            >
              {location.dailyData.map((day) => (
                <CollapsibleForAlertDebug
                  key={day.date}
                  title={`${day.date}: ${day.result}`}
                  className={
                    day.result === "positive" ? "bg-green-800" : "bg-red-800"
                  }
                >
                  {day.hourlyData.map((hour, index) => {
                    return (
                      <CollapsibleForAlertDebug
                        key={index}
                        title={`Hour ${hour.weatherData.time.split("T")[1]}`}
                        className={hour.isGood ? "bg-green-700" : "bg-red-700"}
                        hour={hour}
                      >
                        <HourlyWeatherForAlertDebug hour={hour} />
                      </CollapsibleForAlertDebug>
                    );
                  })}
                </CollapsibleForAlertDebug>
              ))}
            </CollapsibleForAlertDebug>
          ))}
        </div>
      </div>
    </main>
  );
}
