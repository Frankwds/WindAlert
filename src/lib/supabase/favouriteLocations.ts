import { supabase } from "./client";
import {
  FavouriteLocation,
  MinimalForecast,
  ParaglidingLocation,
} from "./types";

export class FavouriteLocationService {

  static async getAllForUserWithForecast(
    userId: string
  ): Promise<(ParaglidingLocation & { forecast_cache: MinimalForecast[] })[]> {
    try {
      // Step 1: Get all favourite locations for the user
      const { data: favData, error: favError } = await supabase
        .from("favourite_locations")
        .select("paragliding_locations!inner(*)")
        .eq("user_id", userId);

      if (favError) {
        console.error("Error fetching favourite locations:", favError);
        throw new Error(`Failed to fetch favourites: ${favError.message}`);
      }

      const locations: ParaglidingLocation[] =
        favData?.map((fav: any) => fav.paragliding_locations) || [];

      if (locations.length === 0) {
        return [];
      }

      // Step 2: Extract location IDs
      const locationIds = locations.map((loc) => loc.id);

      // Step 3: Fetch forecast data for these locations
      const { data: forecastData, error: forecastError } = await supabase
        .from("forecast_cache")
        .select(
          "location_id, time, is_day, weather_code, temperature, wind_speed, wind_gusts, wind_direction, is_promising"
        )
        .in("location_id", locationIds)
        .gte("time", new Date().toISOString());

      if (forecastError) {
        console.error("Error fetching forecast data:", forecastError);
        // Don't throw here, just return locations without forecasts
        return locations.map((location) => ({
          ...location,
          forecast_cache: [],
        }));
      }

      // Step 4: Group forecasts by location_id
      const forecastsByLocation = forecastData.reduce((acc, forecast) => {
        if (!acc[forecast.location_id]) {
          acc[forecast.location_id] = [];
        }
        acc[forecast.location_id].push(forecast);
        return acc;
      }, {} as Record<string, MinimalForecast[]>);

      // Step 5: Combine locations with their forecasts
      const locationsWithForecasts = locations.map((location) => ({
        ...location,
        forecast_cache: forecastsByLocation[location.id] || [],
      }));

      return locationsWithForecasts;
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