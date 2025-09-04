"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { MinimalForecast, ParaglidingLocation } from "@/lib/supabase/types";
import MinimalHourlyWeather from "@/app/components/GoogleMaps/MinimalHourlyWeather";
import TinyWindCompass from "@/app/components/GoogleMaps/TinyWindCompass";
import { locationToWindDirectionSymbols } from "@/lib/utils/getWindDirection";

export default function FavouritesPage() {
  const { data: session, status } = useSession();
  const [
    locations,
    setLocations,
  ] = useState<(ParaglidingLocation & { forecast_cache: MinimalForecast[] })[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      FavouriteLocationService.getAllForUserWithForecast(session.user.id)
        .then((favs) => {
          setLocations(favs);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch favourites:", error);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="z-10 w-full max-w-5xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Favoritter</h1>
          <p>Laster...</p>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="z-10 w-full max-w-5xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Favoritter</h1>
          <p>Vennligst logg inn for å se dine favorittsteder.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Favoritter</h1>
        {locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 sm:p-6 border border-[var(--border)]">
                <div className="flex items-center mb-2">
                  <TinyWindCompass allowedDirections={locationToWindDirectionSymbols(location)} />
                  <Link
                    key={location.id}
                    href={`/locations/${location.id}`}
                    className="underline hover:text-[var(--accent)] transition-colors duration-200"
                  >
                    <h2 className="text-xl font-semibold">{location.name}</h2>
                  </Link>
                </div>
                {location.forecast_cache &&
                  location.forecast_cache.length > 0 ? (
                  <MinimalHourlyWeather
                    weatherData={location.forecast_cache}
                    timezone={'Europe/Oslo'}
                  />
                ) : (
                  <p className="mt-2">Ingen værmeldinger tilgjengelig.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Du har ingen favorittsteder enda.</p>
        )}
      </div>
    </main>
  );
}
