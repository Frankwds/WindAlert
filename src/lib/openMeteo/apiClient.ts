export const API_URL_CONFIG = {
  baseURL: "https://api.open-meteo.com/v1/forecast",
  params: {
    wind_speed_unit: "ms",
    hourly: [
      "wind_speed_1000hPa", "wind_direction_1000hPa",
      "wind_direction_925hPa", "wind_speed_925hPa",
      "wind_speed_850hPa", "wind_direction_850hPa",
      "wind_direction_700hPa", "wind_speed_700hPa",
      "temperature_1000hPa", "temperature_925hPa",
      "temperature_850hPa", "temperature_700hPa",
      "temperature_2m", "precipitation",
      "precipitation_probability", "cloud_cover",
      "wind_speed_10m", "wind_direction_10m",
      "wind_gusts_10m", "weather_code",
      "pressure_msl", "convective_inhibition",
      "cloud_cover_low", "cloud_cover_mid",
      "cloud_cover_high", "is_day",
      "freezing_level_height", "cape",
      "lifted_index", "boundary_layer_height",
      "geopotential_height_1000hPa", "geopotential_height_925hPa",
      "geopotential_height_850hPa", "geopotential_height_700hPa",
    ].join(','),
    forecast_days: "3",
    models: "best_match",
    timezone: "GMT"
  }
};


export async function fetchMeteoData(latitude: number | number[], longitude: number | number[]): Promise<any> {
  const { baseURL, params } = API_URL_CONFIG;
  const url = new URL(baseURL);

  const latString = Array.isArray(latitude) ? latitude.join(',') : latitude.toFixed(4).toString();
  const lonString = Array.isArray(longitude) ? longitude.join(',') : longitude.toFixed(4).toString();

  url.searchParams.append('latitude', latString);
  url.searchParams.append('longitude', lonString);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    cache: 'force-cache',
    next: {
      revalidate: 300,
      tags: ['open-meteo-weather'],
    },
    headers: {
      'Cache-Control': 'public, max-age=300, must-revalidate',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch weather data for ${latString},${lonString}: ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch weather data`);
  }

  return response.json();
}

export async function fetchMeteoDataClient(latitude: number | number[], longitude: number | number[]): Promise<any> {
  const { baseURL, params } = API_URL_CONFIG;
  const url = new URL(baseURL);

  const latString = Array.isArray(latitude) ? latitude.join(',') : latitude.toFixed(4).toString();
  const lonString = Array.isArray(longitude) ? longitude.join(',') : longitude.toFixed(4).toString();

  url.searchParams.append('latitude', latString);
  url.searchParams.append('longitude', lonString);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch weather data for ${latString},${lonString}: ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch weather data`);
  }

  return response.json();
}