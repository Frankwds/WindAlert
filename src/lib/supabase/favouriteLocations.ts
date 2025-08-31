import { supabase } from "./client";
import { FavouriteLocation, ParaglidingLocation } from "./types";

export class FavouriteLocationService {
  /**
   * Get all favourite locations for a user
   */
  static async getAllForUser(
    userId: string
  ): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from("favourite_locations")
      .select("paragliding_locations(*)")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching favourite locations:", error);
      throw error;
    }

    return data.map((fav) => fav.paragliding_locations);
  }

  /**
   * Check if a location is a favourite for a user
   */
  static async isFavourite(
    userId: string,
    locationId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("favourite_locations")
      .select("id")
      .eq("user_id", userId)
      .eq("location_id", locationId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116: "The result contains 0 rows"
      console.error("Error checking favourite status:", error);
      throw error;
    }

    return !!data;
  }

  /**
   * Add a location to a user's favourites
   */
  static async add(
    userId: string,
    locationId: string
  ): Promise<FavouriteLocation> {
    const { data, error } = await supabase
      .from("favourite_locations")
      .insert({ user_id: userId, location_id: locationId })
      .select()
      .single();

    if (error) {
      console.error("Error adding favourite:", error);
      throw error;
    }

    return data;
  }

  /**
   * Remove a location from a user's favourites
   */
  static async remove(userId: string, locationId: string): Promise<void> {
    const { error } = await supabase
      .from("favourite_locations")
      .delete()
      .eq("user_id", userId)
      .eq("location_id", locationId);

    if (error) {
      console.error("Error removing favourite:", error);
      throw error;
    }
  }
}
