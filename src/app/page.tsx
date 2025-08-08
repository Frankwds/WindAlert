import Collapsible from './components/Collapsible';
import { LocationResult, DayResult, HourlyData } from './api/cron/types';

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
        <h1 className="text-4xl font-bold mb-8 text-center">Weather Conditions</h1>
        <div>
          {data.map((location) => (
            <Collapsible
              key={location.locationName}
              title={`${location.alert_name} - ${location.locationName}: ${location.result} (${location.lat}, ${location.long})`}
              className={location.result === 'positive' ? 'bg-green-900' : 'bg-red-900'}
            >
              {location.dailyData.map((day) => (
                <Collapsible
                  key={day.date}
                  title={`${day.date}: ${day.result}`}
                  className={day.result === 'positive' ? 'bg-green-800' : 'bg-red-800'}
                >
                  {day.hourlyData.map((hour, index) => (
                    <Collapsible
                      key={index}
                      title={`Hour ${new Date(hour.weatherData.time).getUTCHours()}:00 - ${hour.isGood ? 'Positive' : 'Negative'}`}
                      className={hour.isGood ? 'bg-green-700' : 'bg-red-700'}
                    >
                      <pre className="text-sm overflow-x-auto">
                        {JSON.stringify(hour.weatherData, null, 2)}
                      </pre>
                    </Collapsible>
                  ))}
                </Collapsible>
              ))}
            </Collapsible>
          ))}
        </div>
      </div>
    </main>
  );
}
