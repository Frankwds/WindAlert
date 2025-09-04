"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { Session } from "next-auth";

interface Props {
  locationId: string;
}

export default function FavouriteHeart({ locationId }: Props) {
  const { data: session, status } = useSession();
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkFavourite = useCallback(async (session: Session) => {
    if (!session.user.id || !locationId) {
      setLoading(false);
      return;
    }
    const isFavourite = await FavouriteLocationService.isFavourite(session.user.id, locationId);
    setIsFavourite(isFavourite);
    setLoading(false);
  }, [locationId]);


  useEffect(() => {
    if (session?.user?.id) {
      checkFavourite(session);
    }
  }, [locationId, session, status, checkFavourite]);


  const toggleFavourite = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      alert("Please log in to favourite locations.");
      return;
    }

    setLoading(true);
    try {
      if (isFavourite) {
        await FavouriteLocationService.remove(session.user.id, locationId);
        setIsFavourite(false);
      } else {
        await FavouriteLocationService.add(session.user.id, locationId);
        setIsFavourite(true);
      }
    } catch (error) {
      console.error("Failed to toggle favourite:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled={true}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] opacity-50 cursor-not-allowed"
      >
        <HeartIconOutline className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium">Laster...</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavourite}
      disabled={loading}
      className="flex items-center gap-2 ml-2 pl-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      title={isFavourite ? "Fjern fra favoritter" : "Legg til favoritter"}
    >
      {isFavourite ? (
        <HeartIconSolid className="w-4 h-4 text-red-500" />
      ) : (
        <HeartIconOutline className="w-4 h-4 text-red-500" />
      )}
      <span className="text-sm font-medium">

      </span>
    </button>
  );
}
