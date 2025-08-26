import { ParaglidingLocationService } from "@/lib/supabase/paraglidingLocations";
import { ParaglidingLocation } from "@/lib/supabase/types";


interface KmlPlacemark {
  name: string;
  description: string | null;
  coordinates: string;
}

/**
 * Parse KML content and extract placemark data
 */
export function parseKmlContent(kmlContent: string): KmlPlacemark[] {
  const placemarks: KmlPlacemark[] = [];

  // Simple regex-based parsing for KML
  // In production, consider using a proper XML parser
  const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
  const nameRegex = /<name>([^<]*)<\/name>/;
  const descriptionRegex = /<description>([\s\S]*?)<\/description>/;
  const coordinatesRegex = /<coordinates>([^<]*)<\/coordinates>/;

  let match;
  while ((match = placemarkRegex.exec(kmlContent)) !== null) {
    const placemarkContent = match[1];

    const nameMatch = placemarkContent.match(nameRegex);
    const descriptionMatch = placemarkContent.match(descriptionRegex);
    const coordinatesMatch = placemarkContent.match(coordinatesRegex);

    if (nameMatch && coordinatesMatch) {
      placemarks.push({
        name: nameMatch[1].trim(),
        description: descriptionMatch ? descriptionMatch[1].trim() : null,
        coordinates: coordinatesMatch[1].trim()
      });
    }
  }

  return placemarks;
}

/**
 * Parse coordinates string and extract longitude, latitude, altitude
 */
export function parseCoordinates(coordinatesStr: string): {
  longitude: number;
  latitude: number;
  altitude: number;
} {
  const parts = coordinatesStr.split(',').map(part => parseFloat(part.trim()));

  if (parts.length >= 2) {
    return {
      longitude: parts[0],
      latitude: parts[1],
      altitude: parts[2] || 0
    };
  }

  throw new Error(`Invalid coordinates format: ${coordinatesStr}`);
}







/**
 * Extract flightlog ID from description
 */
export function extractFlightlogId(description: string | null): string | null {
  if (!description) return null;

  const flightlogRegex = /start_id=(\d+)/;
  const match = description.match(flightlogRegex);

  return match ? match[1] : null;
}

/**
 * Convert KML placemark to database location
 */
export function convertToLocation(placemark: KmlPlacemark): Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'> {
  const coords = parseCoordinates(placemark.coordinates);
  const flightlogId = extractFlightlogId(placemark.description);

  return {
    name: placemark.name,
    description: placemark.description,
    longitude: coords.longitude,
    latitude: coords.latitude,
    altitude: coords.altitude,
    country: 'Norway',
    flightlog_id: flightlogId,
    is_active: true
  };
}

/**
 * Import KML data into the database
 */
export async function importKmlData(kmlContent: string): Promise<{
  total: number;
  imported: number;
  errors: string[];
}> {
  const placemarks = parseKmlContent(kmlContent);
  const results = {
    total: placemarks.length,
    imported: 0,
    errors: [] as string[]
  };

  console.log(`Found ${placemarks.length} placemarks to import`);

  for (const placemark of placemarks) {
    try {
      const location = convertToLocation(placemark);

      // Check if location already exists by flightlog ID
      if (location.flightlog_id) {
        const existing = await ParaglidingLocationService.getByFlightlogId(location.flightlog_id);
        if (existing) {
          console.log(`Location ${location.name} already exists, skipping...`);
          continue;
        }
      }

      await ParaglidingLocationService.create(location);
      results.imported++;
      console.log(`Imported: ${location.name}`);

    } catch (error) {
      const errorMsg = `Failed to import ${placemark.name}: ${error}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }
  }

  console.log(`Import completed: ${results.imported}/${results.total} locations imported`);
  if (results.errors.length > 0) {
    console.log(`Errors: ${results.errors.length}`);
  }

  return results;
}

/**
 * Batch import locations for better performance
 */
export async function batchImportKmlData(
  kmlContent: string,
  batchSize: number = 50
): Promise<{
  total: number;
  imported: number;
  errors: string[];
}> {
  const placemarks = parseKmlContent(kmlContent);
  const results = {
    total: placemarks.length,
    imported: 0,
    errors: [] as string[]
  };

  console.log(`Found ${placemarks.length} placemarks to import in batches of ${batchSize}`);

  // Process in batches
  for (let i = 0; i < placemarks.length; i += batchSize) {
    const batch = placemarks.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(placemarks.length / batchSize)}`);

    const batchPromises = batch.map(async (placemark) => {
      try {
        const location = convertToLocation(placemark);

        // Check if location already exists
        if (location.flightlog_id) {
          const existing = await ParaglidingLocationService.getByFlightlogId(location.flightlog_id);
          if (existing) {
            return { success: false, skipped: true, name: location.name };
          }
        }

        await ParaglidingLocationService.create(location);
        return { success: true, skipped: false, name: location.name };

      } catch (error) {
        return {
          success: false,
          skipped: false,
          name: placemark.name,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    for (const result of batchResults) {
      if (result.success) {
        results.imported++;
        console.log(`Imported: ${result.name}`);
      } else if (result.skipped) {
        console.log(`Skipped: ${result.name} (already exists)`);
      } else {
        const errorMsg = `Failed to import ${result.name}: ${result.error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // Small delay between batches to avoid overwhelming the database
    if (i + batchSize < placemarks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Batch import completed: ${results.imported}/${results.total} locations imported`);
  if (results.errors.length > 0) {
    console.log(`Errors: ${results.errors.length}`);
  }

  return results;
}
