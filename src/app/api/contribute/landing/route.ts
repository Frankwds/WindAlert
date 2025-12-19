import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@/lib/supabase/server';
import { calculateDistance } from '@/lib/utils/calculateDistance';
import { getAuthenticatedUser } from '@/lib/supabase/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    let user;
    try {
      const authHeader = request.headers.get('authorization');
      user = await getAuthenticatedUser(authHeader);
    } catch (authError) {
      return NextResponse.json(
        {
          error: 'Du må være innlogget for å bidra. Vennligst logg inn og prøv igjen.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      locationId,
      takeoffLatitude,
      takeoffLongitude,
      takeoffAltitude,
      landingLatitude,
      landingLongitude,
      landingAltitude,
    } = body;

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

    // Validate takeoff altitude if provided
    if (takeoffAltitude !== undefined && takeoffAltitude !== null) {
      if (typeof takeoffAltitude !== 'number' || takeoffAltitude < 0) {
        return NextResponse.json({ error: 'Ugyldig takeoff-høyde. (Det må være et positivt tall)' }, { status: 400 });
      }
    }

    // Validate landing altitude if provided
    if (landingAltitude !== undefined && landingAltitude !== null) {
      if (typeof landingAltitude !== 'number' || landingAltitude < 0) {
        return NextResponse.json({ error: 'Ugyldig landing-høyde. (Det må være et positivt tall)' }, { status: 400 });
      }
    }

    // Check distance between takeoff and landing
    const distance = calculateDistance(takeoffLatitude, takeoffLongitude, landingLatitude, landingLongitude);

    // Validate using glide ratio if both altitudes are provided
    if (
      takeoffAltitude !== undefined &&
      takeoffAltitude !== null &&
      landingAltitude !== undefined &&
      landingAltitude !== null
    ) {
      const heightDifference = takeoffAltitude - landingAltitude;
      const maxGlideDistance = heightDifference * 10;

      if (distance > maxGlideDistance) {
        return NextResponse.json(
          {
            error: `Landingen er ${Math.round(distance)} meter fra takeoff, men med høydeforskjell på ${Math.round(heightDifference)} meter og glidetallet 10, er maksimal glidedistanse ${Math.round(maxGlideDistance)} meter. 
        Vær grei å ikke ødelegg for alle andre.`,
          },
          { status: 400 }
        );
      }
    } else {
      // Fallback to old validation if altitudes are not provided
      if (distance > 10000) {
        return NextResponse.json(
          {
            error: `Det er useriøst å legge til en landing ${Math.round(distance)} meter fra takeoff.
        Maksimal avstand er 10000 meter. 
        Vær grei å ikke ødelegg for alle andre.`,
          },
          { status: 400 }
        );
      }
    }

    // Fetch current location state to capture previous values
    const currentLocation = await Server.getLocationById(locationId);
    if (!currentLocation) {
      return NextResponse.json(
        {
          error:
            'Av en eller annen grunn fant vi ikke stedet. Meld gjerne fra om feilen via. mail. Legg ved stedets ID som du finner i URLen.',
        },
        { status: 404 }
      );
    }

    // Store previous state
    const previousLandingLatitude = currentLocation.landing_latitude ?? null;
    const previousLandingLongitude = currentLocation.landing_longitude ?? null;
    const previousLandingAltitude = currentLocation.landing_altitude ?? null;

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

    // Insert changelog record (don't fail the request if this fails, but log the error)
    try {
      await Server.insertLandingChangelog({
        location_id: locationId,
        flightlog_id: currentLocation.flightlog_id,
        user_id: user.id,
        previous_landing_latitude: previousLandingLatitude,
        previous_landing_longitude: previousLandingLongitude,
        previous_landing_altitude: previousLandingAltitude,
        new_landing_latitude: landingLatitude,
        new_landing_longitude: landingLongitude,
        new_landing_altitude: landingAltitude ?? null,
      });
    } catch (changelogError) {
      console.error('Error inserting landing changelog:', changelogError);
      // Continue even if changelog insert fails
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
