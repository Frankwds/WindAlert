"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { MinimalForecast, ParaglidingLocation } from "@/lib/supabase/types";
import LocationCardMain from "@/app/components/LocationCards";

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
              <div
                key={location.id}
                className="bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 sm:p-6 border border-[var(--border)]"
              >
                <LocationCardMain
                  location={location}
                  timezone="Europe/Oslo"
                />
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
