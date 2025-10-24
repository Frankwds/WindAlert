import { ParaglidingLocation } from '@/lib/supabase/types';

interface WindDirections {
  n: boolean;
  ne: boolean;
  e: boolean;
  se: boolean;
  s: boolean;
  sw: boolean;
  w: boolean;
  nw: boolean;
}

/**
 * Parse wind directions from image alt text
 * Example: " S SW W" -> { s: true, sw: true, w: true, others: false }
 */
function parseWindDirections(altText: string): WindDirections {
  const directions: WindDirections = {
    n: false,
    ne: false,
    e: false,
    se: false,
    s: false,
    sw: false,
    w: false,
    nw: false,
  };

  // Split by spaces and clean up
  const parts = altText
    .trim()
    .split(/\s+/)
    .filter(part => part.length > 0);

  for (const part of parts) {
    const direction = part.toUpperCase();
    switch (direction) {
      case 'N':
        directions.n = true;
        break;
      case 'NE':
        directions.ne = true;
        break;
      case 'E':
        directions.e = true;
        break;
      case 'SE':
        directions.se = true;
        break;
      case 'S':
        directions.s = true;
        break;
      case 'SW':
        directions.sw = true;
        break;
      case 'W':
        directions.w = true;
        break;
      case 'NW':
        directions.nw = true;
        break;
    }
  }

  return directions;
}

/**
 * Extract location name from breadcrumb navigation
 */
function extractLocationName(html: string): string {
  // Look for the last italic span without a link in the breadcrumb
  const breadcrumbMatch = html.match(/<span style='font-style:italic;'><a[^>]*>([^<]+)<\/a><\/span> <span style='font-family:Courier'>-><\/span> <span style='font-style:italic;'>([^<]+)<\/span>/);
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

  throw new Error('Could not extract location name from breadcrumb');
}

/**
 * Extract data from the main table
 */
function extractTableData(html: string): {
  country: string;
  altitude: number;
  description: string;
  latitude: number;
  longitude: number;
  windDirections: WindDirections;
} {
  // Find the main data table
  const tableMatch = html.match(/<table cellspacing='1' cellpadding='3' bgcolor='black'>([\s\S]*?)<\/table>/);
  if (!tableMatch) {
    throw new Error('Could not find main data table');
  }

  const tableContent = tableMatch[1];
  const rows = tableContent.match(/<tr><td bgcolor='white'>([^<]+)<\/td><td bgcolor='white'>([\s\S]*?)<\/td><\/tr>/g);

  if (!rows) {
    throw new Error('Could not parse table rows');
  }

  let country = 'Norway'; // Default
  let altitude = 0;
  let description = '';
  let latitude = 0;
  let longitude = 0;
  let windDirections: WindDirections = {
    n: false,
    ne: false,
    e: false,
    se: false,
    s: false,
    sw: false,
    w: false,
    nw: false,
  };

  for (const row of rows) {
    const match = row.match(/<tr><td bgcolor='white'>([^<]+)<\/td><td bgcolor='white'>([\s\S]*?)<\/td><\/tr>/);
    if (!match) continue;

    const [, label, value] = match;

    switch (label.trim()) {
      case 'region/fylke':
        // Extract country from region (e.g., "Sogn og Fjordane" -> "Norway")
        country = 'Norway';
        break;

      case 'Høyde':
        // Extract altitude (e.g., "1000 meters asl" -> 1000)
        const altitudeMatch = value.match(/(\d+)\s*meters/);
        if (altitudeMatch) {
          altitude = parseInt(altitudeMatch[1]);
        }
        break;

      case 'Beskrivelse':
        // Extract description and wind directions
        description = value;

        // Find wind direction image
        const windImageMatch = value.match(/<img[^>]*src='\/fl\.html\?rqtid=17&w=[^']*'[^>]*alt='([^']*)'/);
        if (windImageMatch) {
          windDirections = parseWindDirections(windImageMatch[1]);

          // Remove the wind direction image from description
          description = description.replace(/<img[^>]*src='\/fl\.html\?rqtid=17&w=[^']*'[^>]*>/g, '');
        }

        // Clean up description
        description = description.trim();
        break;

      case 'Koordinater':
        // Extract coordinates from Google Earth link
        const coordMatch = value.match(/earth\.google\.com\/web\/search\/([0-9.-]+),([0-9.-]+)/);
        if (coordMatch) {
          latitude = parseFloat(coordMatch[1]);
          longitude = parseFloat(coordMatch[2]);
        }
        break;
    }
  }

  if (latitude === 0 || longitude === 0) {
    throw new Error('Could not extract coordinates');
  }

  return {
    country,
    altitude,
    description,
    latitude,
    longitude,
    windDirections,
  };
}

/**
 * Process description and add flightlog link
 */
function processDescription(description: string, startId: string): string {
  // Clean up the description
  let processedDescription = description.replace(/<br\s*\/?>/gi, '<br/>').trim();

  // Fix relative photo links by prepending flightlog.org domain and add target="_blank"
  processedDescription = processedDescription.replace(/href='\/fl\.html\?([^']*)'/g, "href='https://www.flightlog.org/fl.html?$1' target='_blank'");

  // Fix relative image sources by prepending flightlog.org domain
  processedDescription = processedDescription.replace(/src='\/fl\.html\?([^']*)'/g, "src='https://www.flightlog.org/fl.html?$1'");

  // Add flightlog link
  const flightlogUrl = `https://flightlog.org/fl.html?l=1a=22country_id=160start_id=${startId}`;
  processedDescription += `<br/><a href="${flightlogUrl}">${flightlogUrl}</a>`;

  return processedDescription;
}

/**
 * Process HTML from flightlog.org and extract paragliding location data
 */
export function processHTML(html: string, startId: string): Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'> {
  // Extract data from HTML
  const locationName = extractLocationName(html);
  const tableData = extractTableData(html);
  const processedDescription = processDescription(tableData.description, startId);

  // Return location data without landing fields and is_main
  return {
    name: locationName,
    description: processedDescription,
    longitude: tableData.longitude,
    latitude: tableData.latitude,
    altitude: tableData.altitude,
    country: tableData.country,
    flightlog_id: startId,
    is_active: true,
    ...tableData.windDirections,
  };
}
