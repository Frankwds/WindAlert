export const API_URL_CONFIG = {
  baseURL: "https://api.met.no/weatherapi/locationforecast/2.0/complete"
};

export async function fetchYrData(
  latitude: number,
  longitude: number,
  ifModifiedSince?: string
): Promise<{ data: any; headers: Headers; status: number }> {
  const url = `${API_URL_CONFIG.baseURL}?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`;

  const headers: HeadersInit = {
    'User-Agent': 'windlord.no',
  };

  if (ifModifiedSince) {
    headers['If-Modified-Since'] = ifModifiedSince;
  }

  const response = await fetch(url, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status !== 304) {
      const errorText = await response.text();
      console.error(`Failed to fetch weather data for ${latitude},${longitude}: ${response.statusText}`, errorText);
    }
    return {
      data: null,
      headers: response.headers,
      status: response.status,
    };
  }

  return {
    data: await response.json(),
    headers: response.headers,
    status: response.status,
  };
}
