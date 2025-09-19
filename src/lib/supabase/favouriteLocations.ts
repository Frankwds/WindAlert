import { supabase } from "./client";
import {
  FavouriteLocation,
  MinimalForecast,
  ParaglidingLocation,
} from "./types";

export class FavouriteLocationService {
  /**
   * Get all favourite locations for a user
   */
  static async getAllForUser(
    userId: string
  ): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from("favourite_locations")
      .select(`
      paragliding_locations!inner(*)
    `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching favourite locations:", error);
      throw error;
    }

    const flattenedData: ParaglidingLocation[] = data?.map((fav: any) => fav.paragliding_locations) || [];
    return flattenedData;
  }

  static async getAllForUserWithForecast(
    userId: string
  ): Promise<(ParaglidingLocation & { forecast_cache: MinimalForecast[] })[]> {
    // Step 1: Get all favourite locations for the user
    const { data: favData, error: favError } = await supabase
      .from("favourite_locations")
      .select("paragliding_locations!inner(*)")
      .eq("user_id", userId);

    if (favError) {
      console.error("Error fetching favourite locations:", favError);
      throw favError;
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
      throw forecastError;
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
