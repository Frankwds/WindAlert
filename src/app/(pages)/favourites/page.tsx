"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { FavouriteLocation } from "@/lib/supabase/types";

export default function FavouritesPage() {
  const { data: session, status } = useSession();
  const [favourites, setFavourites] = useState<FavouriteLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      FavouriteLocationService.getAllForUser(session.user.id)
        .then((favs) => {
          setFavourites(favs);
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

  const handleNotificationToggle = async (
    favourite: FavouriteLocation,
    field: "notify_today" | "notify_tomorrow" | "notify_in_two_days"
  ) => {
    if (!session?.user?.id) return;

    const updatedFavourite = await FavouriteLocationService.update(
      session.user.id,
      Number(favourite.location_id),
      {
        [field]: !favourite[field],
      }
    );

    setFavourites((prev) =>
      prev.map((fav) =>
        fav.id === updatedFavourite.id ? updatedFavourite : fav
      )
    );
  };

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
        {favourites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favourites.map((favourite) => (
              <div
                key={favourite.id}
                className="p-4 bg-[var(--border)] rounded-lg"
              >
                <Link href={`/locations/${favourite.location_id}`}>
                  <h2 className="text-xl font-semibold hover:underline">
                    {favourite.paragliding_locations.name}
                  </h2>
                </Link>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Notify me via email for promising conditions:
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        handleNotificationToggle(favourite, "notify_today")
                      }
                      className={`px-3 py-1 text-sm rounded-md ${
                        favourite.notify_today
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() =>
                        handleNotificationToggle(favourite, "notify_tomorrow")
                      }
                      className={`px-3 py-1 text-sm rounded-md ${
                        favourite.notify_tomorrow
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      onClick={() =>
                        handleNotificationToggle(
                          favourite,
                          "notify_in_two_days"
                        )
                      }
                      className={`px-3 py-1 text-sm rounded-md ${
                        favourite.notify_in_two_days
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      In two days
                    </button>
                  </div>
                </div>
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
