import { ParaglidingLocation } from '@/lib/supabase/types';

/**
 * Parse wind directions from image alt text and update locationData
 * Example: " S SW W" -> sets s: true, sw: true, w: true, others remain false
 */
function parseWindDirections(
  altText: string,
  locationData: Omit<
    ParaglidingLocation,
    'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'
  >
): void {
  // Split by spaces and clean up
  const parts = altText
    .trim()
    .split(/\s+/)
    .filter(part => part.length > 0);

  for (const part of parts) {
    const direction = part.toUpperCase();
    switch (direction) {
      case 'N':
        locationData.n = true;
        break;
      case 'NE':
        locationData.ne = true;
        break;
      case 'E':
        locationData.e = true;
        break;
      case 'SE':
        locationData.se = true;
        break;
      case 'S':
        locationData.s = true;
        break;
      case 'SW':
        locationData.sw = true;
        break;
      case 'W':
        locationData.w = true;
        break;
      case 'NW':
        locationData.nw = true;
        break;
    }
  }
}

/**
 * Extract location name from breadcrumb navigation
 */
function extractLocationName(html: string): string {
  // Look for the last italic span without a link in the breadcrumb
  const breadcrumbMatch = html.match(
    /<span style='font-style:italic;'><a[^>]*>([^<]+)<\/a><\/span> <span style='font-family:Courier'>-><\/span> <span style='font-style:italic;'>([^<]+)<\/span>/
  );
  if (breadcrumbMatch) {
    return breadcrumbMatch[2];
  }

  // Fallback: look for any italic span without a link
  const fallbackMatch = html.match(/<span style='font-style:italic;'>([^<]+)<\/span>/g);
  if (fallbackMatch && fallbackMatch.length > 0) {
    const lastMatch = fallbackMatch[fallbackMatch.length - 1];
    const nameMatch = lastMatch.match(/<span style='font-style:italic;'>([^<]+)<\/span>/);
    if (nameMatch) {
      return nameMatch[1];
    }
  }

  // Return empty string if no name found
  return '';
}

/**
 * Country ID to country name mapping
 * Maps flightlog.org country_id values to country names
 */
const COUNTRY_ID_MAP: Record<number, string> = {
  144: 'Morocco',
  160: 'Norway',
  // Add more mappings as needed
};

/**
 * Extract country from "show in google earth" link
 * The country_id in this link is the correct one, unlike the breadcrumb which may be wrong
 */
function extractCountry(html: string): string {
  // Look for country_id in the "show in google earth" link
  // Example: <a href='...map=google_earth&country_id=144&...'>'show in google earth'</a>
  const googleEarthMatch = html.match(/map=google_earth[^']*country_id=(\d+)/);
  if (googleEarthMatch) {
    const countryId = parseInt(googleEarthMatch[1], 10);
    const countryName = COUNTRY_ID_MAP[countryId];
    if (countryName) {
      return countryName;
    }
  }

  // Return empty string if no country found
  return '';
}

/**
 * Extract location data from HTML
 */
function extractLocationData(
  html: string
): Omit<
  ParaglidingLocation,
  'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'
> {
  // Initialize empty location data
  const locationData: Omit<
    ParaglidingLocation,
    'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'
  > = {
    name: '',
    country: '',
    altitude: 0,
    description: '',
    latitude: 0,
    longitude: 0,
    flightlog_id: '',
    is_active: true,
    n: false,
    ne: false,
    e: false,
    se: false,
    s: false,
    sw: false,
    w: false,
    nw: false,
  };

  // Extract location name and country
  locationData.name = extractLocationName(html);
  locationData.country = extractCountry(html);

  // Find the main data table
  const tableMatch = html.match(/<table cellspacing='1' cellpadding='3' bgcolor='black'>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    return locationData;
  }

  const tableContent = tableMatch[1];
  const rows = tableContent.match(/<tr><td bgcolor='white'>([^<]+)<\/td><td bgcolor='white'>([\s\S]*?)<\/td><\/tr>/g);

  if (!rows) {
    return locationData;
  }

  for (const row of rows) {
    const match = row.match(/<tr><td bgcolor='white'>([^<]+)<\/td><td bgcolor='white'>([\s\S]*?)<\/td><\/tr>/);
    if (!match) continue;

    const [, label, value] = match;

    switch (label.trim()) {
      case 'region/fylke':
        // Region/fylke information is not needed since we extract country from breadcrumb
        break;

      case 'Høyde':
        // Extract altitude (e.g., "1000 meters asl" -> 1000)
        const altitudeMatch = value.match(/(\d+)\s*meters/);
        if (altitudeMatch) {
          locationData.altitude = parseInt(altitudeMatch[1]);
        }
        break;

      case 'Beskrivelse':
        // Extract description and wind directions
        locationData.description = value;

        // Find wind direction image
        const windImageMatch = value.match(/<img[^>]*src='\/fl\.html\?rqtid=17&w=[^']*'[^>]*alt='([^']*)'/);
        if (windImageMatch) {
          parseWindDirections(windImageMatch[1], locationData);

          // Remove the wind direction image from description
          locationData.description = locationData.description.replace(
            /<img[^>]*src='\/fl\.html\?rqtid=17&w=[^']*'[^>]*>/g,
            ''
          );
        }

        // Clean up description
        locationData.description = locationData.description.trim();
        break;

      case 'Koordinater':
        // Extract coordinates from Google Earth link
        const coordMatch = value.match(/earth\.google\.com\/web\/search\/([0-9.-]+),([0-9.-]+)/);
        if (coordMatch) {
          locationData.latitude = parseFloat(coordMatch[1]);
          locationData.longitude = parseFloat(coordMatch[2]);
        }
        break;
    }
  }

  // Coordinates will be validated later in the route handler

  return locationData;
}

/**
 * Process description and add flightlog link
 */
function processDescription(description: string): string {
  // Clean up the description
  let processedDescription = description.replace(/<br\s*\/?>/gi, '<br/>').trim();

  // Fix relative photo links by prepending flightlog.org domain and add target="_blank"
  processedDescription = processedDescription.replace(
    /href='\/fl\.html\?([^']*)'/g,
    "href='https://www.flightlog.org/fl.html?$1' target='_blank'"
  );

  // Fix relative image sources by prepending flightlog.org domain
  processedDescription = processedDescription.replace(
    /src='\/fl\.html\?([^']*)'/g,
    "src='https://www.flightlog.org/fl.html?$1'"
  );

  return processedDescription;
}

/**
 * Process HTML from flightlog.org and extract paragliding location data
 */
export function processHTML(
  html: string,
  startId: string
): Omit<
  ParaglidingLocation,
  'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'
> {
  // Extract location data from HTML
  const locationData = extractLocationData(html);

  // Set the flightlog_id
  locationData.flightlog_id = startId;

  // Process description and add flightlog link
  locationData.description = processDescription(locationData.description || '');

  return locationData;
}
