import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const landingLat = searchParams.get('landingLat');
  const landingLon = searchParams.get('landingLon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key is missing' }, { status: 500 });
  }

  try {
    // Build markers string - main location (red) + landing (green) if available
    let markers = `markers=color:red%7Clabel:S%7C${lat},${lon}`;
    if (landingLat && landingLon) {
      markers += `&markers=color:green%7Clabel:L%7C${landingLat},${landingLon}`;
    }

    const mapSrc = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=640x640&maptype=hybrid&${markers}&key=${apiKey}`;
    const mapSrcTerrain = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=640x640&maptype=terrain&${markers}&key=${apiKey}`;

    return NextResponse.json({
      hybrid: mapSrc,
      terrain: mapSrcTerrain,
      googleMapsUrl: `https://maps.google.com/?q=${lat},${lon}&z=12&t=k`
    });
  } catch (error) {
    console.error('Error generating static map URLs:', error);
    return NextResponse.json({ error: 'Failed to generate map URLs' }, { status: 500 });
  }
}
