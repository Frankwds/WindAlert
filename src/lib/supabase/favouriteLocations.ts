import { supabase } from "./client";
import {
  FavouriteLocation,
  ParaglidingLocationWithForecast,
} from "./types";

export class FavouriteLocationService {

  static async getAllForUserWithForecast(
    userId: string
  ): Promise<ParaglidingLocationWithForecast[]> {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from("favourite_locations")
        .select(`
          paragliding_locations!inner(
            id, name, latitude, longitude, altitude, flightlog_id, n, e, s, w, ne, se, sw, nw,
            forecast_cache(
              time,
              is_day,
              weather_code,
              temperature,
              wind_speed,
              wind_gusts,
              wind_direction,
              is_promising
            )
          )
        `)
        .eq("user_id", userId)
        .gte("paragliding_locations.forecast_cache.time", now.toISOString());

      if (error) {
        console.error("Error fetching favourite locations with forecast:", error);
        throw new Error(`Failed to fetch favourites: ${error.message}`);
      }

      return (data?.map((fav: any) => fav.paragliding_locations) as ParaglidingLocationWithForecast[]) || [];
    } catch (error) {
      console.error("Error in getAllForUserWithForecast:", error);
      throw error;
    }
  }

  /**
   * Check if a location is a favourite for a user
   */
  static async isFavourite(
    userId: string,
    locationId: string
  ): Promise<boolean> {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        console.warn("User not authenticated or user ID mismatch");
        return false;
      }

      const { data, error } = await supabase
        .from("favourite_locations")
        .select("id")
        .eq("user_id", userId)
        .eq("location_id", locationId)
        .maybeSingle();

      if (error) {
        console.error("Error checking favourite status:", error);
        throw new Error(`Failed to check favourite status: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error("Error in isFavourite:", error);
      return false;
    }
  }

  /**
   * Add a location to a user's favourites
   */
  static async add(
    userId: string,
    locationId: string
  ): Promise<FavouriteLocation> {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("favourite_locations")
        .insert({ user_id: userId, location_id: locationId })
        .select()
        .single();

      if (error) {
        console.error("Error adding favourite:", error);
        throw new Error(`Failed to add favourite: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error in add:", error);
      throw error;
    }
  }

  /**
   * Remove a location from a user's favourites
   */
  static async remove(userId: string, locationId: string): Promise<void> {
    try {
      // First check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("favourite_locations")
        .delete()
        .eq("user_id", userId)
        .eq("location_id", locationId);

      if (error) {
        console.error("Error removing favourite:", error);
        throw new Error(`Failed to remove favourite: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in remove:", error);
      throw error;
    }
  }
}