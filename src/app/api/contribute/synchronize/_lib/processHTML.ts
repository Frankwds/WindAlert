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
  // Handle both single and double quotes, and HTML entity -&gt;
  const breadcrumbMatch = html.match(
    /<span style=["']font-style:italic;["']><a[^>]*>([^<]+)<\/a><\/span> <span style=["']font-family:Courier["']>-&gt;<\/span> <span style=["']font-style:italic;["']>([^<]+)<\/span>/
  );
  if (breadcrumbMatch) {
    return breadcrumbMatch[2];
  }

  // Fallback: look for any italic span without a link (handles both quote styles)
  const fallbackMatch = html.match(/<span style=["']font-style:italic;["']>([^<]+)<\/span>/g);
  if (fallbackMatch && fallbackMatch.length > 0) {
    // Find the last span that doesn't contain a link
    for (let i = fallbackMatch.length - 1; i >= 0; i--) {
      const match = fallbackMatch[i];
      // Check if this span doesn't contain an <a> tag
      if (!match.includes('<a')) {
        const nameMatch = match.match(/<span style=["']font-style:italic;["']>([^<]+)<\/span>/);
        if (nameMatch) {
          return nameMatch[1];
        }
      }
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
  2: 'Albania',
  6: 'Angola',
  10: 'Argentina',
  11: 'Armenia',
  13: 'Australia',
  14: 'Austria',
  15: 'Azerbaijan',
  21: 'Belgium',
  26: 'Bolivia',
  27: 'Bosnia and Herzegovina',
  30: 'Brazil',
  33: 'Bulgaria',
  38: 'Canada',
  39: 'Cape Verde',
  43: 'Chile',
  44: "China, People's Republic of",
  47: 'Colombia',
  51: 'Costa Rica',
  53: 'Croatia',
  54: 'Cuba',
  55: 'Cyprus',
  56: 'Czech Republic',
  57: 'Denmark',
  60: 'Dominican Republic',
  62: 'Ecuador',
  64: 'El Salvador',
  67: 'Estonia',
  70: 'Faroe Islands',
  71: 'Fiji',
  72: 'Finland',
  73: 'France',
  76: 'French Polynesia',
  77: 'French Southern Territories',
  80: 'Georgia',
  81: 'Germany',
  82: 'Ghana',
  84: 'Greece',
  85: 'Greenland',
  89: 'Guatemala',
  95: 'Honduras',
  96: 'Hong Kong',
  97: 'Hungary',
  98: 'Iceland',
  99: 'India',
  100: 'Indonesia',
  101: 'Iran, Islamic Republic of',
  102: 'Iraq',
  103: 'Ireland',
  104: 'Israel',
  105: 'Italy',
  107: 'Japan',
  108: 'Jordan',
  109: 'Kazakhstan',
  110: 'Kenya',
  112: "Korea, Democratic People's Republic of",
  113: 'Korea, Republic of',
  115: 'Kyrgyzstan',
  117: 'Latvia',
  122: 'Liechtenstein',
  123: 'Lithuania',
  126: 'North Macedonia',
  129: 'Malaysia',
  132: 'Malta',
  136: 'Mauritius',
  138: 'Mexico',
  141: 'Monaco',
  144: 'Morocco',
  147: 'Namibia',
  148: 'Nauru',
  149: 'Nepal',
  150: 'Netherlands',
  153: 'New Zealand',
  160: 'Norway',
  161: 'Oman',
  162: 'Pakistan',
  167: 'Peru',
  168: 'Philippines',
  170: 'Poland',
  171: 'Portugal',
  172: 'Puerto Rico',
  174: 'Réunion',
  175: 'Romania',
  176: 'Russian Federation',
  189: 'Slovakia',
  190: 'Slovenia',
  193: 'South Africa',
  195: 'Spain',
  201: 'Svalbard and Jan Mayen',
  203: 'Sweden',
  204: 'Switzerland',
  206: 'Taiwan (Republic of China)',
  207: 'Tajikistan',
  208: 'Tanzania, United Republic Of',
  209: 'Thailand',
  215: 'Turkey',
  219: 'Uganda',
  220: 'Ukraine',
  221: 'United Arab Emirates',
  222: 'United Kingdom',
  223: 'United States',
  229: 'Venezuela',
  230: 'Viet Nam',
  236: 'Serbia and Montenegro',
  242: 'Serbia',
  243: 'Montenegro',
};

/**
 * Extract country from "show in google earth" link
 * The country_id in this link is the correct one, unlike the breadcrumb which may be wrong
 */
function extractCountry(html: string): string {
  // Look for country_id in the "show in google earth" link
  // Example: <a href='...map=google_earth&country_id=144&...'>'show in google earth'</a>
  const googleEarthMatch = html.match(/map=google_earth[^"']*country_id=(\d+)/);
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
    timezone: '',
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
  const tableMatch = html.match(
    /<table cellspacing=["']1["'] cellpadding=["']3["'] bgcolor=["']black["']>([\s\S]*?)<\/table>/
  );
  if (!tableMatch) {
    return locationData;
  }

  const tableContent = tableMatch[1];
  const rows = tableContent.match(
    /<tr><td bgcolor=["']white["']>([^<]+)<\/td><td bgcolor=["']white["']>([\s\S]*?)<\/td><\/tr>/g
  );

  if (!rows) {
    return locationData;
  }

  for (const row of rows) {
    const match = row.match(
      /<tr><td bgcolor=["']white["']>([^<]+)<\/td><td bgcolor=["']white["']>([\s\S]*?)<\/td><\/tr>/
    );
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
        // Match img tag that contains rqtid=17&w= in src attribute
        // Handles attributes in any order and HTML entities (& or &amp;)
        const windImageTagMatch = value.match(/<img[^>]*\/fl\.html\?rqtid=17(&amp;|&)w=[^>]*>/);
        if (windImageTagMatch) {
          const imgTag = windImageTagMatch[0];

          // Extract alt text from the img tag (handles attributes in any order)
          const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
          if (altMatch) {
            parseWindDirections(altMatch[1], locationData);
          }

          // Remove the wind direction image from description
          locationData.description = locationData.description.replace(
            /<img[^>]*\/fl\.html\?rqtid=17(&amp;|&)w=[^>]*>/g,
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
    /href=["']\/fl\.html\?([^"']*)["']/g,
    "href='https://flightlog.org/fl.html?$1' target='_blank'"
  );

  // Fix relative image sources by prepending flightlog.org domain
  processedDescription = processedDescription.replace(
    /src=["']\/fl\.html\?([^"']*)["']/g,
    "src='https://flightlog.org/fl.html?$1'"
  );

  // Replace alt text "photo of start" with " Bilde fra flightlog" (using &nbsp; for space)
  processedDescription = processedDescription.replace(/alt=["']photo of start["']/g, "alt='&nbsp;Bilde fra flightlog'");

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
