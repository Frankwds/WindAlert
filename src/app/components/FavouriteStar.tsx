"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FavouriteLocationService } from "@/lib/supabase/favouriteLocations";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";

interface Props {
  locationId: string;
}

export default function FavouriteStar({ locationId }: Props) {
  const { data: session, status } = useSession();
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      FavouriteLocationService.isFavourite(session.user.id, locationId)
        .then((fav) => {
          setIsFavourite(fav);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to check favourite status:", error);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, locationId]);

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
        <StarIconSolid className="w-6 h-6 text-yellow-500" />
      ) : (
        <StarIconOutline className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
}
