"use client";

import { useState, useEffect } from "react";
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

  const checkFavourite = async (session: Session) => {
    if (!session.user.id || !locationId) {
      setLoading(false);
      return;
    }
    const isFavourite = await FavouriteLocationService.isFavourite(session.user.id, locationId);
    setIsFavourite(isFavourite);
    setLoading(false);
  };


  useEffect(() => {
    if (session?.user?.id) {
      checkFavourite(session);
    }
  }, [locationId, session, status]);


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
    return <div className="w-6 h-6" />;
  }

  return (
    <button onClick={toggleFavourite} disabled={loading}>
      {isFavourite ? (
        <HeartIconSolid className="w-6 h-6 text-red-500" />
      ) : (
        <HeartIconOutline className="w-6 h-6 text-red-500" />
      )}
    </button>
  );
}
