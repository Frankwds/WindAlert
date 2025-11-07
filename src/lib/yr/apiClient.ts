export const API_URL_CONFIG = {
  baseURL: 'https://api.met.no/weatherapi/locationforecast/2.0/complete',
};

export async function fetchYrData(latitude: number, longitude: number): Promise<any> {
  const url = `${API_URL_CONFIG.baseURL}?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'windlord (https://windalert.vercel.app/)',
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
    cache: 'force-cache',
    next: {
      revalidate: 300,
      tags: ['yr-weather'],
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch weather data for ${latitude},${longitude}: ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch weather data`);
  }
  return response.json();
}

export async function fetchYrDataClient(latitude: number, longitude: number): Promise<any> {
  const url = `/api/yr?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch weather data for ${latitude},${longitude}: ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch weather data`);
  }
  return response.json();
}
