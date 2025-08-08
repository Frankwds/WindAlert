async function getData() {
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
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Cron Job Results</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item: { name: string; result: string }) => (
            <div
              key={item.name}
              className={`p-4 rounded-lg ${
                item.result === "positive" ? "bg-green-700" : "bg-red-700"
              }`}
            >
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-lg">{item.result}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
