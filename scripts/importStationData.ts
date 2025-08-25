import { WeatherStationService } from '../src/lib/supabase/weatherStations';
import { WeatherStation } from '../src/lib/supabase/types';

interface StationData {
  stationId: string;
  name: string;
  coordinates: string | null;
}

/**
 * Parse station names from stations.txt
 */
export function parseStationNames(content: string): Map<string, string> {
  const stations = new Map<string, string>();

  const lines = content.split(/\r?\n/);
  console.log(`Processing ${lines.length} lines from stations file`);

  for (const line of lines) {
    if (line.trim()) {
      console.log(`Processing line: "${line}"`);
      const match = line.match(/^(\d+):\s*(.+)$/);
      if (match) {
        const stationId = match[1].trim();
        const name = match[2].trim();
        console.log(`  Matched: ID=${stationId}, Name="${name}"`);
        stations.set(stationId, name);
      } else {
        console.warn(`Failed to parse line: "${line}"`);
      }
    }
  }

  console.log(`Successfully parsed ${stations.size} station names`);
  return stations;
}

/**
 * Parse station coordinates from stationsCoordinates.txt
 */
export function parseStationCoordinates(content: string): Map<string, string> {
  const coordinates = new Map<string, string>();

  const lines = content.split(/\r?\n/);
  console.log(`Processing ${lines.length} lines from coordinates file`);

  for (const line of lines) {
    if (line.trim()) {
      console.log(`Processing coordinates line: "${line}"`);
      const match = line.match(/^(\d+):\s*(.+)$/);
      if (match) {
        const stationId = match[1].trim();
        const coordString = match[2].trim();

        if (coordString !== 'No coordinates found') {
          console.log(`  Matched: ID=${stationId}, Coords="${coordString}"`);
          coordinates.set(stationId, coordString);
        } else {
          console.log(`  Skipping: ID=${stationId} (no coordinates)`);
        }
      } else {
        console.warn(`Failed to parse coordinates line: "${line}"`);
      }
    }
  }

  console.log(`Successfully parsed ${coordinates.size} coordinate entries`);
  return coordinates;
}

/**
 * Parse coordinates string and extract longitude, latitude
 */
export function parseCoordinates(coordinatesStr: string): {
  longitude: number;
  latitude: number;
} {
  const parts = coordinatesStr.split(',').map(part => parseFloat(part.trim()));

  if (parts.length >= 2) {
    return {
      longitude: parts[0],
      latitude: parts[1]
    };
  }

  throw new Error(`Invalid coordinates format: ${coordinatesStr}`);
}

/**
 * Convert station data to database station
 */
export function convertToStation(stationData: StationData): Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'> | null {
  // Skip stations without coordinates
  if (!stationData.coordinates) {
    return null;
  }

  let longitude: number | null = null;
  let latitude: number | null = null;

  try {
    const coords = parseCoordinates(stationData.coordinates);
    longitude = coords.longitude;
    latitude = coords.latitude;
  } catch (error) {
    console.warn(`Failed to parse coordinates for station ${stationData.stationId}: ${stationData.coordinates}`);
    return null; // Skip stations with invalid coordinates
  }

  return {
    station_id: stationData.stationId,
    name: stationData.name,
    longitude,
    latitude,
    altitude: 0, // Default altitude
    country: null, // Could be enhanced with country detection based on coordinates
    region: null, // Could be enhanced with region detection based on coordinates
    is_active: true
  };
}

/**
 * Import station data into the database
 */
export async function importStationData(
  stationNamesContent: string,
  stationCoordinatesContent: string
): Promise<{
  total: number;
  imported: number;
  errors: string[];
}> {
  const stationNames = parseStationNames(stationNamesContent);
  const stationCoordinates = parseStationCoordinates(stationCoordinatesContent);

  const results = {
    total: stationNames.size,
    imported: 0,
    errors: [] as string[]
  };

  console.log(`Found ${stationNames.size} stations to import`);

  for (const [stationId, name] of stationNames) {
    try {
      const coordinates = stationCoordinates.get(stationId) || null;

      const stationData: StationData = {
        stationId,
        name,
        coordinates
      };

      const station = convertToStation(stationData);

      // Skip stations without coordinates
      if (!station) {
        console.log(`Skipping station ${stationData.name} (no valid coordinates)`);
        continue;
      }

      // Check if station already exists by station ID
      const existing = await WeatherStationService.getByStationId(station.station_id);
      if (existing) {
        console.log(`Station ${station.name} already exists, skipping...`);
        continue;
      }

      await WeatherStationService.create(station);
      results.imported++;
      console.log(`Imported: ${station.name}`);

    } catch (error) {
      const errorMsg = `Failed to import station ${stationId}: ${error}`;
      console.error(errorMsg);
      results.errors.push(errorMsg);
    }
  }

  console.log(`Import completed: ${results.imported}/${results.total} stations imported`);
  if (results.errors.length > 0) {
    console.log(`Errors: ${results.errors.length}`);
  }

  return results;
}

/**
 * Batch import stations for better performance
 */
export async function batchImportStationData(
  stationNamesContent: string,
  stationCoordinatesContent: string,
  batchSize: number = 50
): Promise<{
  total: number;
  imported: number;
  errors: string[];
}> {
  const stationNames = parseStationNames(stationNamesContent);
  const stationCoordinates = parseStationCoordinates(stationCoordinatesContent);

  const results = {
    total: stationNames.size,
    imported: 0,
    errors: [] as string[]
  };

  console.log(`Found ${stationNames.size} stations to import in batches of ${batchSize}`);

  // Convert to array for batch processing
  const stationsArray = Array.from(stationNames.entries());

  // Process in batches
  for (let i = 0; i < stationsArray.length; i += batchSize) {
    const batch = stationsArray.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stationsArray.length / batchSize)}`);

    const batchPromises = batch.map(async ([stationId, name]) => {
      try {
        const coordinates = stationCoordinates.get(stationId) || null;

        const stationData: StationData = {
          stationId,
          name,
          coordinates
        };

        const station = convertToStation(stationData);

        // Skip stations without coordinates
        if (!station) {
          return { success: false, skipped: true, name: name, reason: 'no coordinates' };
        }

        // Check if station already exists
        const existing = await WeatherStationService.getByStationId(station.station_id);
        if (existing) {
          return { success: false, skipped: true, name: station.name, reason: 'already exists' };
        }

        await WeatherStationService.create(station);
        return { success: true, skipped: false, name: station.name };

      } catch (error) {
        return {
          success: false,
          skipped: false,
          name: name,
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
        const reason = (result as any).reason || 'unknown';
        if (reason === 'no coordinates') {
          console.log(`Skipped: ${result.name} (no coordinates)`);
        } else {
          console.log(`Skipped: ${result.name} (${reason})`);
        }
      } else {
        const errorMsg = `Failed to import ${result.name}: ${result.error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // Small delay between batches to avoid overwhelming the database
    if (i + batchSize < stationsArray.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Batch import completed: ${results.imported}/${results.total} stations imported`);
  if (results.errors.length > 0) {
    console.log(`Errors: ${results.errors.length}`);
  }

  return results;
}
