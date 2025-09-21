import axios from 'axios';
import url from 'url';
import { holfuyResponseSchema } from './zod';
import { mapHolfuyToStationData } from './mapping';
import { StationData, WeatherStation } from '../supabase/types';

export async function fetchHolfuyData(): Promise<{
  stationData: Omit<StationData, 'id'>[], holfuyStation: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>[]
}> {
  const proxyUrl = process.env.FIXIE_URL;
  const apiKey = process.env.HOLFUY_API_KEY;

  if (!proxyUrl) {
    throw new Error('FIXIE_URL environment variable is not set');
  }

  if (!apiKey) {
    throw new Error('HOLFUY_API_KEY environment variable is not set');
  }

  const fixieUrl = url.parse(proxyUrl);
  if (!fixieUrl.hostname || !fixieUrl.port || !fixieUrl.auth) {
    throw new Error('Invalid proxy URL');
  }
  const fixieAuth = fixieUrl.auth.split(':');

  const response = await axios.get(`https://api.holfuy.com/live/?s=all&pw=${apiKey}&m=JSON&tu=C&su=m/s&avg=1&utc&loc`, {
    proxy: {
      protocol: 'http',
      host: fixieUrl.hostname,
      port: parseInt(fixieUrl.port),
      auth: { username: fixieAuth[0], password: fixieAuth[1] }
    }
  });

  // Validate and parse the response data
  const validatedData = holfuyResponseSchema.parse(response.data.measurements);
  const { stationData, holfuyStation } = mapHolfuyToStationData(validatedData);

  return { stationData, holfuyStation };
}