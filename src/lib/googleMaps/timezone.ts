import axios from 'axios';

/**
 * Fetch timezone for a given latitude and longitude using Google Maps Time Zone API
 * Returns timezone in IANA format (e.g., "Europe/Oslo")
 * Returns empty string if API call fails (graceful degradation)
 */
export async function fetchTimezone(latitude: number, longitude: number): Promise<string> {
  try {
    // Use server-side API key (preferred) or fallback to public key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('Google Maps API key is not set. Skipping timezone fetch.');
      return '';
    }

    // Get current Unix timestamp (required by Google Maps Time Zone API)
    const timestamp = Math.floor(Date.now() / 1000);

    const response = await axios.get('https://maps.googleapis.com/maps/api/timezone/json', {
      params: {
        location: `${latitude},${longitude}`,
        timestamp: timestamp,
        key: apiKey,
      },
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'WindAlert/1.0',
      },
    });

    // Check if the API returned an error status
    if (response.data.status !== 'OK') {
      console.warn(
        `Google Maps Time Zone API returned status: ${response.data.status} for coordinates ${latitude},${longitude}`
      );
      return '';
    }

    // Extract timeZoneId from response (e.g., "Europe/Oslo")
    const timeZoneId = response.data.timeZoneId;

    if (!timeZoneId || typeof timeZoneId !== 'string') {
      console.warn(`Invalid timeZoneId in response for coordinates ${latitude},${longitude}`);
      return '';
    }

    return timeZoneId;
  } catch (error) {
    console.error(`Error fetching timezone for coordinates ${latitude},${longitude}:`, error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`HTTP Error ${error.response.status}: ${error.response.statusText}`);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Network error - no response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
    }

    // Return empty string on error (graceful degradation)
    return '';
  }
}
