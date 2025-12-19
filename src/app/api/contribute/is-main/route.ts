import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@/lib/supabase/server';
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
    const { locationId, is_main } = body;

    // Validate required fields
    if (!locationId || typeof is_main !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Missing required fields: locationId and is_main (boolean)',
        },
        { status: 400 }
      );
    }

    // Validate locationId is a string
    if (typeof locationId !== 'string' || locationId.trim().length === 0) {
      return NextResponse.json({ error: 'Ugyldig locationId' }, { status: 400 });
    }

    // Fetch current location state to capture previous is_main value
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
    const previousIsMain = currentLocation.is_main;

    // Update the is_main status
    const updatedLocation = await Server.updateLocationIsMain(locationId, is_main);

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
      await Server.insertIsMainChangelog({
        location_id: locationId,
        flightlog_id: currentLocation.flightlog_id,
        user_id: user.id,
        previous_is_main: previousIsMain,
        new_is_main: is_main,
      });
    } catch (changelogError) {
      console.error('Error inserting is_main changelog:', changelogError);
      // Continue even if changelog insert fails
    }

    return NextResponse.json({
      success: true,
      location: updatedLocation,
    });
  } catch (error) {
    console.error('Error updating is_main status:', error);
    return NextResponse.json(
      {
        error:
          'Det skjedde en mystiskfeil. Prøv igjen senere. Meld gjerne fra om feilen via. mail. Legg ved stedets ID som du finner i URLen.',
      },
      { status: 500 }
    );
  }
}
