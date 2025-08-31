import { supabase } from "./client";
import { FavouriteLocation, ParaglidingLocation } from "./types";

export class FavouriteLocationService {
  /**
   * Get all favourite locations for a user
   */
  static async getAllForUser(
    googleId: string
  ): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from("favourite_locations")
      .select(`
      paragliding_locations!inner(*)
    `)
      .eq("google_id", googleId);

    if (error) {
      console.error("Error fetching favourite locations:", error);
      throw error;
    }

    const flattenedData: ParaglidingLocation[] = data?.map((fav: any) => fav.paragliding_locations) || [];
    return flattenedData;
  }

  /**
   * Check if a location is a favourite for a user
   */
  static async isFavourite(
    googleId: string,
    locationId: string
  ): Promise<boolean> {
    console.log("googleId", googleId);
    console.log("locationId", locationId);
    const { data, error } = await supabase
      .from("favourite_locations")
      .select("id")
      .eq("google_id", googleId)
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
    googleId: string,
    locationId: string
  ): Promise<FavouriteLocation> {
    console.log("googleId", googleId);
    console.log("locationId", locationId);
    const { data, error } = await supabase
      .from("favourite_locations")
      .insert({ google_id: googleId, location_id: locationId })
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
  static async remove(googleId: string, locationId: string): Promise<void> {
    const { error } = await supabase
      .from("favourite_locations")
      .delete()
      .eq("google_id", googleId)
      .eq("location_id", locationId);

    if (error) {
      console.error("Error removing favourite:", error);
      throw error;
    }
  }
}
