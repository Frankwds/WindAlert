import { NextRequest, NextResponse } from 'next/server';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, landingLatitude, landingLongitude } = body;

    // Validate required fields
    if (!locationId || !landingLatitude || !landingLongitude) {
      return NextResponse.json(
        { error: 'Missing required fields: locationId, landingLatitude, landingLongitude' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (
      typeof landingLatitude !== 'number' ||
      typeof landingLongitude !== 'number' ||
      landingLatitude < -90 || landingLatitude > 90 ||
      landingLongitude < -180 || landingLongitude > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Update the landing coordinates
    const updatedLocation = await ParaglidingLocationService.updateLocationLanding(
      locationId,
      landingLatitude,
      landingLongitude
    );

    if (!updatedLocation) {
      return NextResponse.json(
        { error: 'Location not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      location: updatedLocation
    });

  } catch (error) {
    console.error('Error updating landing coordinates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
