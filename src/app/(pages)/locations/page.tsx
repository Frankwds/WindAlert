import { LOCATIONS } from "@/app/api/cron/mockdata/locations";
import Link from "next/link";

export default function LocationsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Locations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOCATIONS.map((location) => (
            <Link
              key={location.id}
              href={`/locations/${location.id}`}
              className="p-4 bg-[var(--border)] rounded-lg hover:bg-[var(--border)]/80 transition-colors"
            >
              <h2 className="text-xl font-semibold">{location.name}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
