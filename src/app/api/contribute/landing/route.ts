import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@/lib/supabase/server';
import { calculateDistance } from '@/lib/utils/calculateDistance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, takeoffLatitude, takeoffLongitude, landingLatitude, landingLongitude, landingAltitude } = body;

    // Validate required fields
    if (!locationId || !takeoffLatitude || !takeoffLongitude || !landingLatitude || !landingLongitude) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: locationId, takeoffLatitude, takeoffLongitude, landingLatitude, landingLongitude',
        },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (
      typeof takeoffLatitude !== 'number' ||
      typeof takeoffLongitude !== 'number' ||
      typeof landingLatitude !== 'number' ||
      typeof landingLongitude !== 'number' ||
      takeoffLatitude < -90 ||
      takeoffLatitude > 90 ||
      takeoffLongitude < -180 ||
      takeoffLongitude > 180 ||
      landingLatitude < -90 ||
      landingLatitude > 90 ||
      landingLongitude < -180 ||
      landingLongitude > 180
    ) {
      return NextResponse.json({ error: 'Koordinatene er ugyldige' }, { status: 400 });
    }

    // Validate altitude if provided
    if (landingAltitude !== undefined && landingAltitude !== null) {
      if (typeof landingAltitude !== 'number' || landingAltitude < 0) {
        return NextResponse.json({ error: 'Ugyldig høyde. (Det må være et positivt tall)' }, { status: 400 });
      }
    }

    // Check distance between takeoff and landing
    const distance = calculateDistance(takeoffLatitude, takeoffLongitude, landingLatitude, landingLongitude);
    if (distance > 5000) {
      return NextResponse.json(
        {
          error: `Det er useriøst å legge til en landing ${Math.round(distance)} meter fra takeoff. 
        Maksimal avstand er 5000 meter. 
        Vær grei å ikke ødelegg for alle andre.`,
        },
        { status: 400 }
      );
    }

    // Update the landing coordinates
    const updatedLocation = await Server.updateLocationLanding(
      locationId,
      landingLatitude,
      landingLongitude,
      landingAltitude
    );

    if (!updatedLocation) {
      return NextResponse.json(
        {
          error:
            'Av en eller annen grunn fant vi ikke stedet. Meld gjerne fra om feilen via. mail. Legg ved stedets ID som du finner i URLen.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      location: updatedLocation,
    });
  } catch (error) {
    console.error('Error updating landing coordinates:', error);
    return NextResponse.json(
      {
        error:
          'Det skjedde en mystiskfeil. Prøv igjen senere. Meld gjerne fra om feilen via. mail. Legg ved stedets ID som du finner i URLen.',
      },
      { status: 500 }
    );
  }
}
