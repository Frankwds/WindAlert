import axios from 'axios';
import { metFrostResponseSchema } from './zod';
import { mapMetFrostToWeatherStation } from './mapping';
import { WeatherStation } from '../supabase/types';

export async function fetchMetFrostStations(): Promise<Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>[]> {
  try {
    console.log('Fetching Met Frost stations...');

    const clientId = process.env.MET_CLIENT_ID;
    if (!clientId) {
      throw new Error('MET_CLIENT_ID environment variable is not set');
    }

    // Create Basic auth header (clientId:password format, but Met Frost only needs clientId)
    const authHeader = Buffer.from(`${clientId}:`).toString('base64');

    const response = await axios.get('https://frost.met.no/sources/v0.jsonld', {
      timeout: 30000, // 30 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WindAlert/1.0',
        'Authorization': `Basic ${authHeader}`,
      },
    });

    console.log(`Response data contains ${response.data?.data?.length || 0} stations`);

    // Validate and parse the response data
    const validatedData = metFrostResponseSchema.parse(response.data);

    console.log(`Validated ${validatedData.data.length} stations from Met Frost API`);

    // Map to WeatherStation format
    const weatherStations = mapMetFrostToWeatherStation(validatedData.data);

    console.log(`Mapped ${weatherStations.length} valid weather stations`);

    return weatherStations;
  } catch (error) {
    console.error('Error fetching Met Frost stations:', error);

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

    throw new Error(`Failed to fetch Met Frost stations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
