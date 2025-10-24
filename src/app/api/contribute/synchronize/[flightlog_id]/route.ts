import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@/lib/supabase/server';
import { processHTML } from '../_lib/processHTML';
import { ValidationError, validateHtmlContent, validateFlightlogId, validateLocationData } from '../_lib/validate';

export async function GET(_: NextRequest, { params }: { params: Promise<{ flightlog_id: string }> }) {
  try {
    const { flightlog_id } = await params;

    // Validate flightlog_id input
    validateFlightlogId(flightlog_id);

    // Fetch HTML from flightlog.org
    const url = `https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${flightlog_id}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch data from flightlog.org: ${response.status}` }, { status: 500 });
    }

    const html = await response.text();

    // Validate HTML content
    validateHtmlContent(html);

    // Process HTML and extract location data
    const locationData = processHTML(html, flightlog_id);

    // Validate the location data
    validateLocationData(locationData);

    // Upsert to database
    const savedLocation = await Server.upsertParaglidingLocation(locationData);

    return NextResponse.json(savedLocation);
  } catch (error) {
    console.error('Error processing flightlog data:', error);

    // Handle validation errors with Norwegian messages
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          message: 'Valideringsfeil ved behandling av flightlog-data',
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ukjent feil oppstod',
        message: 'Kunne ikke behandle flightlog-data',
      },
      { status: 500 }
    );
  }
}
