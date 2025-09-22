"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface Props {
  locationId: string;
}

export default function FavouriteHeart({ locationId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const checkFavourite = useCallback(async (userId: string) => {
    if (!userId || !locationId) {
      setLoading(false);
      return;
    }

    try {
      const isFavourite = await FavouriteLocationService.isFavourite(userId, locationId);
      setIsFavourite(isFavourite);
      setError(null);
    } catch (err) {
      console.error("Failed to check favourite status:", err);
      setError("Kunne ikke sjekke favorittstatus");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    if (user?.id) {
      checkFavourite(user.id);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [locationId, user, authLoading, checkFavourite]);

  const toggleFavourite = async () => {
    if (!user?.id) {
      alert("Du må være innlogget for å kunne legge til favoritter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isFavourite) {
        await FavouriteLocationService.remove(user.id, locationId);
        setIsFavourite(false);
      } else {
        await FavouriteLocationService.add(user.id, locationId);
        setIsFavourite(true);
      }
    } catch (err) {
      console.error("Failed to toggle favourite:", err);
      setError("Kunne ikke oppdatere favoritter");
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <button
        disabled={true}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)]"
      >
        <HeartIconOutline className="w-4 h-4 text-red-500" />
        <span className="text-sm font-medium">Laster...</span>
      </button>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <button
          onClick={() => setError(null)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-red-50"
          title="Klikk for å prøve igjen"
        >
          <HeartIconOutline className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-600">Feil</span>
        </button>
        <span className="text-xs text-red-500 text-center">{error}</span>
      </div>
    );
  }

  return (
    <button
      onClick={toggleFavourite}
      disabled={loading}
      className={`flex items-center gap-2 pl-2 rounded-lg border border-[var(--border)] cursor-pointer ${!isMobile ? 'hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)]' : ''}`}
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
