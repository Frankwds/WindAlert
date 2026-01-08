import { NextRequest, NextResponse } from 'next/server';
import { Server } from '@/lib/supabase/server';
import { processHTML } from '../_lib/processHTML';
import { ValidationError, validateHtmlContent, validateFlightlogId, validateLocationData } from '../_lib/validate';
import { fetchTimezone } from '@/lib/googleMaps/timezone';
import puppeteerCore from 'puppeteer-core';

export async function GET(_: NextRequest, { params }: { params: Promise<{ flightlog_id: string }> }) {
  let browser;
  try {
    const { flightlog_id } = await params;

    // Validate flightlog_id input
    validateFlightlogId(flightlog_id);

    // Fetch HTML from flightlog.org
    const url = `https://flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${flightlog_id}`;

    // Get Browserless API token from environment variables
    const browserlessToken = process.env.BROWSERLESS_API_KEY;
    if (!browserlessToken) {
      throw new Error('BROWSERLESS_API_KEY environment variable is not set');
    }

    // Connect to Browserless.io using stealth mode (recommended)
    browser = await puppeteerCore.connect({
      browserWSEndpoint: `wss://production-sfo.browserless.io/stealth?token=${browserlessToken}`,
    });

    const page = await browser.newPage();

    // Set viewport size
    await page.setViewport({ width: 1920, height: 1080 });

    // First, visit the homepage to establish a session
    await page.goto('https://flightlog.org/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Now navigate to the actual location page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Check if we got redirected to homepage
    const currentUrl = page.url();
    if (currentUrl === 'https://www.flightlog.org/' || currentUrl === 'https://flightlog.org') {
      console.warn(`Warning: Redirected to homepage for flightlog_id: ${flightlog_id}`);
      throw new Error('Site redirected to homepage');
    }

    // Get the HTML content
    const html = await page.content();

    // Validate HTML content
    validateHtmlContent(html);

    // Process HTML and extract location data
    const locationData = processHTML(html, flightlog_id);

    // Validate the location data
    validateLocationData(locationData);

    // Fetch timezone from Google Maps Time Zone API
    locationData.timezone = await fetchTimezone(locationData.latitude, locationData.longitude);

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
  } finally {
    // Always disconnect from the remote browser
    if (browser) {
      await browser.disconnect();
    }
  }
}
