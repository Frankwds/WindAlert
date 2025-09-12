import { AllParaglidingLocationService } from "@/lib/supabase/allParaglidingLocations";
import { ParaglidingLocation } from "@/lib/supabase/types";
import { readFileSync } from 'fs';
import { join } from 'path';

interface KmlPlacemark {
  name: string;
  description: string | null;
  coordinates: string;
}

// Country mapping based on country IDs
const COUNTRY_MAPPING: Record<string, string> = {
  '2': 'Albania',
  '6': 'Angola',
  '10': 'Argentina',
  '11': 'Armenia',
  '13': 'Australia',
  '14': 'Austria',
  '15': 'Azerbaijan',
  '21': 'Belgium',
  '26': 'Bolivia',
  '27': 'Bosnia and Herzegovina',
  '30': 'Brazil',
  '33': 'Bulgaria',
  '38': 'Canada',
  '39': 'Cape Verde',
  '43': 'Chile',
  '44': 'China, People\'s Republic of',
  '47': 'Colombia',
  '51': 'Costa Rica',
  '53': 'Croatia',
  '54': 'Cuba',
  '55': 'Cyprus',
  '56': 'Czech Republic',
  '57': 'Denmark',
  '60': 'Dominican Republic',
  '62': 'Ecuador',
  '64': 'El Salvador',
  '67': 'Estonia',
  '70': 'Faroe Islands',
  '71': 'Fiji',
  '72': 'Finland',
  '73': 'France',
  '76': 'French Polynesia',
  '77': 'French Southern Territories',
  '80': 'Georgia',
  '81': 'Germany',
  '82': 'Ghana',
  '84': 'Greece',
  '85': 'Greenland',
  '89': 'Guatemala',
  '95': 'Honduras',
  '96': 'Hong Kong',
  '97': 'Hungary',
  '98': 'Iceland',
  '99': 'India',
  '100': 'Indonesia',
  '101': 'Iran, Islamic Republic of',
  '102': 'Iraq',
  '103': 'Ireland',
  '104': 'Israel',
  '105': 'Italy',
  '107': 'Japan',
  '108': 'Jordan',
  '109': 'Kazakhstan',
  '110': 'Kenya',
  '112': 'Korea, Democratic People\'s Republic of',
  '113': 'Korea, Republic of',
  '115': 'Kyrgyzstan',
  '117': 'Latvia',
  '122': 'Liechtenstein',
  '123': 'Lithuania',
  '126': 'North Macedonia',
  '129': 'Malaysia',
  '132': 'Malta',
  '136': 'Mauritius',
  '138': 'Mexico',
  '141': 'Monaco',
  '144': 'Morocco',
  '147': 'Namibia',
  '148': 'Nauru',
  '149': 'Nepal',
  '150': 'Netherlands',
  '153': 'New Zealand',
  '160': 'Norway',
  '161': 'Oman',
  '162': 'Pakistan',
  '167': 'Peru',
  '168': 'Philippines',
  '170': 'Poland',
  '171': 'Portugal',
  '172': 'Puerto Rico',
  '174': 'Réunion',
  '175': 'Romania',
  '176': 'Russian Federation',
  '189': 'Slovakia',
  '190': 'Slovenia',
  '193': 'South Africa',
  '195': 'Spain',
  '201': 'Svalbard and Jan Mayen',
  '203': 'Sweden',
  '204': 'Switzerland',
  '206': 'Taiwan (Republic of China)',
  '207': 'Tajikistan',
  '208': 'Tanzania, United Republic Of',
  '209': 'Thailand',
  '215': 'Turkey',
  '219': 'Uganda',
  '220': 'Ukraine',
  '221': 'United Arab Emirates',
  '222': 'United Kingdom',
  '223': 'United States',
  '229': 'Venezuela',
  '230': 'Viet Nam',
  '236': 'Serbia and Montenegro',
  '242': 'Serbia',
  '243': 'Montenegro'
};

/**
 * Extract country ID from filename and map to country name
 */
export function getCountryFromFilename(filename: string): string {
  const match = filename.match(/country_(\d+)_fixed\.kml/);
  if (!match) {
    console.warn(`Could not extract country ID from filename: ${filename}`);
    return 'Unknown';
  }

  const countryId = match[1];
  const countryName = COUNTRY_MAPPING[countryId];

  if (!countryName) {
    console.warn(`Unknown country ID: ${countryId} for file: ${filename}`);
    return `Unknown_${countryId}`;
  }

  return countryName;
}

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
    // Validate coordinate ranges
    const longitude = Number(parts[0].toFixed(6));
    const latitude = Number(parts[1].toFixed(6));
    const altitude = parts[2] ? Number(parts[2].toFixed(6)) : 0;

    // Check if coordinates are within valid ranges
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
    }
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
    }



    return {
      longitude,
      latitude,
      altitude
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
 * Read allowed flightlog IDs from CSV file
 */
export function readAllowedFlightlogIds(): Set<string> {
  try {
    const filePath = join(process.cwd(), 'data', 'ids_to_keep_flights_at_least_23_24_csv.txt');
    const content = readFileSync(filePath, 'utf-8');
    const ids = content.trim().split(',').map(id => id.trim());
    return new Set(ids);
  } catch (error) {
    console.error('Error reading allowed flightlog IDs file:', error);
    return new Set();
  }
}

/**
 * Convert KML placemark to database location with country from filename
 */
export function convertToLocation(placemark: KmlPlacemark, country: string): Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'> {
  const coords = parseCoordinates(placemark.coordinates);
  const flightlogId = extractFlightlogId(placemark.description);

  return {
    name: placemark.name,
    description: placemark.description,
    longitude: coords.longitude,
    latitude: coords.latitude,
    altitude: coords.altitude,
    country: country,
    flightlog_id: flightlogId,
    is_active: true,
    n: false,
    e: false,
    s: false,
    w: false,
    ne: false,
    se: false,
    sw: false,
    nw: false
  };
}

/**
 * Import KML data from a single file
 */
export async function importKmlFile(filePath: string, batchSize: number = 50): Promise<{
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
  country: string;
}> {
  const filename = filePath.split('/').pop() || filePath.split('\\').pop() || '';
  const country = getCountryFromFilename(filename);

  console.log(`\n📁 Processing file: ${filename} (Country: ${country})`);

  const kmlContent = readFileSync(filePath, 'utf-8');
  const placemarks = parseKmlContent(kmlContent);
  // const allowedFlightlogIds = readAllowedFlightlogIds();

  const results = {
    total: placemarks.length,
    imported: 0,
    skipped: 0,
    errors: [] as string[],
    country
  };

  console.log(`  Found ${placemarks.length} placemarks in ${filename}`);

  // Process in batches
  for (let i = 0; i < placemarks.length; i += batchSize) {
    const batch = placemarks.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(placemarks.length / batchSize);

    if (totalBatches > 1) {
      console.log(`  Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
    }

    const batchPromises = batch.map(async (placemark) => {
      try {
        const location = convertToLocation(placemark, country);

        // Check if location already exists
        if (location.flightlog_id) {
          const existing = await AllParaglidingLocationService.getByFlightlogId(location.flightlog_id);
          if (existing) {
            return { success: false, skipped: true, name: location.name, reason: 'already exists' };
          }
        }

        // Debug logging for problematic coordinates
        if (Math.abs(location.longitude) >= 100 || Math.abs(location.latitude) >= 100) {
          console.warn(`⚠️  Large coordinate values for ${location.name}:`, {
            longitude: location.longitude,
            latitude: location.latitude,
            altitude: location.altitude
          });
        }

        await AllParaglidingLocationService.upsert(location);
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
        if (totalBatches === 1) {
          console.log(`    ✓ Imported: ${result.name}`);
        }
      } else if (result.skipped) {
        results.skipped++;
        if (totalBatches === 1) {
          console.log(`    - Skipped: ${result.name} (${result.reason})`);
        }
      } else {
        const errorMsg = `Failed to import ${result.name}: ${result.error}`;
        console.error(`    ✗ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // Small delay between batches to avoid overwhelming the database
    if (i + batchSize < placemarks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`  Completed ${filename}: ${results.imported}/${results.total} imported, ${results.skipped} skipped, ${results.errors.length} errors`);
  return results;
}

/**
 * Batch import all KML files
 */
export async function batchImportAllKmlData(
  kmlFiles: string[],
  batchSize: number = 50
): Promise<{
  totalFiles: number;
  totalLocations: number;
  imported: number;
  skipped: number;
  errors: string[];
  fileResults: Array<{
    filename: string;
    country: string;
    total: number;
    imported: number;
    skipped: number;
    errors: number;
  }>;
}> {
  const results = {
    totalFiles: kmlFiles.length,
    totalLocations: 0,
    imported: 0,
    skipped: 0,
    errors: [] as string[],
    fileResults: [] as Array<{
      filename: string;
      country: string;
      total: number;
      imported: number;
      skipped: number;
      errors: number;
    }>
  };

  console.log(`🚀 Starting batch import of ${kmlFiles.length} KML files...`);

  for (let i = 0; i < kmlFiles.length; i++) {
    const filePath = kmlFiles[i];
    const filename = filePath.split('/').pop() || filePath.split('\\').pop() || '';

    try {
      console.log(`\n[${i + 1}/${kmlFiles.length}] Processing: ${filename}`);

      const fileResult = await importKmlFile(filePath, batchSize);

      results.totalLocations += fileResult.total;
      results.imported += fileResult.imported;
      results.skipped += fileResult.skipped;
      results.errors.push(...fileResult.errors);

      results.fileResults.push({
        filename,
        country: fileResult.country,
        total: fileResult.total,
        imported: fileResult.imported,
        skipped: fileResult.skipped,
        errors: fileResult.errors.length
      });

    } catch (error) {
      const errorMsg = `Failed to process file ${filename}: ${error}`;
      console.error(`❌ ${errorMsg}`);
      results.errors.push(errorMsg);

      results.fileResults.push({
        filename,
        country: 'Unknown',
        total: 0,
        imported: 0,
        skipped: 0,
        errors: 1
      });
    }
  }

  console.log(`\n📊 Batch import completed!`);
  console.log(`Files processed: ${results.totalFiles}`);
  console.log(`Total locations: ${results.totalLocations}`);
  console.log(`Imported: ${results.imported}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors.length}`);

  return results;
}
