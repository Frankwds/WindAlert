"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { ParaglidingLocation } from "@/lib/supabase/types";

export default function FavouritesPage() {
  const { data: session, status } = useSession();
  const [locations, setLocations] = useState<ParaglidingLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      FavouriteLocationService.getAllForUser(session.user.id)
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
          <h1 className="text-4xl font-bold mb-8 text-center">Favourites</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="z-10 w-full max-w-5xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Favourites</h1>
          <p>Please log in to see your favourite locations.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Favourites</h1>
        {locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/favourites/${location.id}`}
                className="p-4 bg-[var(--border)] rounded-lg hover:bg-[var(--border)]/80 transition-colors"
              >
                <h2 className="text-xl font-semibold">{location.name}</h2>
              </Link>
            ))}
          </div>
        ) : (
          <p>You have no favourite locations yet.</p>
        )}
      </div>
    </main>
  );
}
