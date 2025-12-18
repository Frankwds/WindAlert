import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/serverClient';
import { fetchTimezone } from '@/lib/googleMaps/timezone';
import { ParaglidingLocation } from '@/lib/supabase/types';

/**
 * One-off endpoint to update timezones for all existing paragliding locations
 * Excludes Norway locations (already set to Europe/Oslo)
 *
 * CAN BE DELETED AND REMOVED FROM THE CODEBASE FOR ANY REASON - WE NEED NOT MAINTAIN THIS ENDPOINT
 *
 * GET /api/timezones
 */
export async function GET(_: NextRequest) {
  try {
    console.log('Starting timezone update for all non-Norway locations...');

    // Fetch all locations where country != 'Norway' AND timezone is empty
    const PAGE_SIZE = 1000;
    let allLocations: Pick<ParaglidingLocation, 'id' | 'latitude' | 'longitude' | 'timezone' | 'country' | 'name'>[] =
      [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabaseServer
        .from('all_paragliding_locations')
        .select('id, latitude, longitude, timezone, country, name')
        .neq('country', 'Norway')
        .range(from, to);

      if (error) {
        console.error(`Error fetching locations on page ${page}:`, error);
        throw error;
      }

      if (data && data.length > 0) {
        // Filter for locations with empty or null timezone
        const locationsWithEmptyTimezone = data.filter(loc => !loc.timezone || loc.timezone.trim() === '');
        allLocations = [...allLocations, ...locationsWithEmptyTimezone];
        page++;
        if (data.length < PAGE_SIZE) {
          hasMoreData = false;
        }
      } else {
        hasMoreData = false;
      }
    }

    console.log(`Found ${allLocations.length} locations to process (with empty timezone)`);

    // Phase 1: Fetch all timezones from Google Maps API
    console.log('Phase 1: Fetching timezones from Google Maps API...');
    const locationUpdates: Array<{
      id: string;
      name: string;
      country: string;
      timezone: string;
    }> = [];
    const errors: Array<{ id: string; name: string; error: string }> = [];

    for (const location of allLocations) {
      try {
        // Validate coordinates
        if (!location.latitude || !location.longitude || location.latitude === 0 || location.longitude === 0) {
          errors.push({
            id: location.id,
            name: location.name || 'Unknown',
            error: 'Invalid coordinates',
          });
          continue;
        }

        // Fetch timezone from Google Maps API
        const timezone = await fetchTimezone(location.latitude, location.longitude);

        if (!timezone || timezone.trim() === '') {
          errors.push({
            id: location.id,
            name: location.name || 'Unknown',
            error: 'Failed to fetch timezone from API',
          });
          continue;
        }

        locationUpdates.push({
          id: location.id,
          name: location.name || 'Unknown',
          country: location.country || 'Unknown',
          timezone: timezone,
        });

        // Log progress every 50 locations
        if (locationUpdates.length % 50 === 0) {
          console.log(`Fetched timezones: ${locationUpdates.length}/${allLocations.length}`);
        }
      } catch (error) {
        errors.push({
          id: location.id,
          name: location.name || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Error fetching timezone for location ${location.id}:`, error);
      }
    }

    console.log(`Phase 1 complete: ${locationUpdates.length} timezones fetched, ${errors.length} failed`);

    // Phase 2: Batch update to Supabase
    console.log('Phase 2: Batch updating timezones to database...');
    const BATCH_SIZE = 100;
    let updated = 0;
    let updateFailed = 0;

    for (let i = 0; i < locationUpdates.length; i += BATCH_SIZE) {
      const batch = locationUpdates.slice(i, i + BATCH_SIZE);
      const now = new Date().toISOString();

      // Update each location in the batch
      const updatePromises = batch.map(location =>
        supabaseServer
          .from('all_paragliding_locations')
          .update({
            timezone: location.timezone,
            updated_at: now,
          })
          .eq('id', location.id)
      );

      const updateResults = await Promise.all(updatePromises);

      // Count successes and failures
      for (let j = 0; j < updateResults.length; j++) {
        const { error } = updateResults[j];
        if (error) {
          updateFailed++;
          errors.push({
            id: batch[j].id,
            name: batch[j].name,
            error: error.message,
          });
        } else {
          updated++;
        }
      }

      // Log progress
      console.log(
        `Batch update progress: ${Math.min(i + BATCH_SIZE, locationUpdates.length)}/${locationUpdates.length} processed`
      );
    }

    console.log(`Phase 2 complete: ${updated} updated, ${updateFailed} failed`);

    const results = {
      total: allLocations.length,
      updated: updated,
      failed: errors.length,
      errors: errors,
      updatedLocations: locationUpdates.slice(0, 10), // Return first 10 as sample
    };

    console.log(`Timezone update complete: ${results.updated} updated, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      summary: {
        total: results.total,
        updated: results.updated,
        failed: results.failed,
      },
      updatedLocations: results.updatedLocations, // Return first 10 as sample
      errors: results.errors.slice(0, 10), // Return first 10 errors as sample
      message: `Processed ${results.total} locations. Updated ${results.updated}, failed ${results.failed}.`,
    });
  } catch (error) {
    console.error('Error in timezone update endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to update timezones',
      },
      { status: 500 }
    );
  }
}
