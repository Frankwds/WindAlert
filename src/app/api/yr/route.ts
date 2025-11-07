import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
  }

  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat}&lon=${lon}`;

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
      console.error(`Failed to fetch YR weather data for ${lat},${lon}: ${response.statusText}`, errorText);
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching YR weather data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
