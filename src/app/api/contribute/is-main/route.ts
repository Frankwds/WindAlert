import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
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

