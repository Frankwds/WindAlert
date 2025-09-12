#!/usr/bin/env tsx

import { ParaglidingLocation } from '../src/lib/supabase/types';
import { createClient } from '@supabase/supabase-js'
import { writeFileSync, appendFileSync } from 'fs';



export const supabase = createClient(
  "https://nlkmkpzksktvcleqginf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sa21rcHprc2t0dmNsZXFnaW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNTM3MTcsImV4cCI6MjA3MDgyOTcxN30.fd6inCSUFJr3QpmSlWCkRlXKyueDjVhiCiLmVGaxY8o"
)
// Configuration
const BATCH_SIZE = 50;
const BASE_URL = "https://www.flightlog.org/fl.html?l=2&country_id=160&a=22&start_id=";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
const ERROR_FILE = "scripts/wind_directions_errors.txt";
const NOT_FOUND_FILE = "scripts/wind_directions_not_found.txt";

/**
 * Helper function to write to error file
 */
function writeError(flightlogId: string, locationName: string, error: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${flightlogId} (${locationName}): ${error}\n`;
  appendFileSync(ERROR_FILE, logEntry);
}

/**
 * Helper function to write to not found file
 */
function writeNotFound(flightlogId: string, locationName: string): void {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - ${flightlogId} (${locationName})\n`;
  appendFileSync(NOT_FOUND_FILE, logEntry);
}

/**
 * Initialize log files
 */
function initializeLogFiles(): void {
  const timestamp = new Date().toISOString();
  writeFileSync(ERROR_FILE, `Wind Directions Extraction Errors - Started ${timestamp}\n`);
  writeFileSync(NOT_FOUND_FILE, `Wind Directions Not Found - Started ${timestamp}\n`);
}

interface WindDirections {
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
  updated_at: string;
}

/**
 * Extract wind directions from HTML content
 */
function extractWindDirections(htmlContent: string): WindDirections | null {
  // Look specifically for img tags with rqtid=17 and extract alt attribute
  const imgMatch = htmlContent.match(/<img[^>]*rqtid=17[^>]*alt=['"]([^'"]*)['"][^>]*>/i);

  if (!imgMatch || !imgMatch[1]) {
    return null;
  }

  const windDirs = imgMatch[1].trim();

  // Check if this looks like wind directions (contains N, E, S, W)
  if (/[NESW]/.test(windDirs)) {
    return parseWindDirections(windDirs);
  }

  return null;
}

/**
 * Parse wind direction string into boolean flags
 * Expected format: " N NE E SE S SW W NW" or " SW" etc.
 */
function parseWindDirections(windDirs: string): WindDirections {
  const upper = windDirs.toUpperCase().trim();

  // Simple word boundary matching for the specific format
  return {
    n: /\bN\b/.test(upper),
    e: /\bE\b/.test(upper),
    s: /\bS\b/.test(upper),
    w: /\bW\b/.test(upper),
    ne: /\bNE\b/.test(upper),
    se: /\bSE\b/.test(upper),
    sw: /\bSW\b/.test(upper),
    nw: /\bNW\b/.test(upper),
    updated_at: new Date().toISOString()
  };
}

/**
 * Make HTTP request to flightlog.org
 */
async function makeRequest(flightlogId: string): Promise<string> {
  const url = `${BASE_URL}${flightlogId}`;

  // Add delay to be respectful to the server
  await new Promise(resolve => setTimeout(resolve, 300));

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Get locations that need wind direction updates which are updated before 1757716348000
 */
async function getLocationsNeedingWindDirections(limit: number): Promise<ParaglidingLocation[]> {
  const { data, error } = await supabase
    .from('all_paragliding_locations')
    .select('*')
    .eq('is_active', true)
    .not('flightlog_id', 'is', null)
    .eq('n', false)
    .eq('e', false)
    .eq('s', false)
    .eq('w', false)
    .eq('ne', false)
    .eq('se', false)
    .eq('sw', false)
    .eq('nw', false)
    .gt('updated_at', '2025-09-13T17:32:28.000Z')
    .lt('updated_at', '2025-09-13T19:00:00.000Z')
    .limit(limit)

  if (error) {
    console.error('Error fetching locations needing wind directions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Update wind directions for a location
 */
async function updateWindDirections(locationId: string, windDirections: WindDirections): Promise<void> {
  const { error } = await supabase
    .from('all_paragliding_locations')
    .update(windDirections)
    .eq('id', locationId);

  if (error) {
    console.error(`Error updating wind directions for location ${locationId}:`, error);
    throw error;
  }
}

/**
 * Process a single location
 */
async function processLocation(location: ParaglidingLocation): Promise<boolean> {
  if (!location.flightlog_id) {
    console.log(`  Skipping ${location.name} - no flightlog_id`);
    return false;
  }

  try {
    console.log(`  Processing ${location.name} (ID: ${location.flightlog_id})...`);

    const htmlContent = await makeRequest(location.flightlog_id);
    const windDirections = extractWindDirections(htmlContent);

    if (windDirections) {
      await updateWindDirections(location.id, windDirections);
      return true;
    } else {
      console.log(`  ✗ No wind directions found`);
      await updateWindDirections(location.id, { n: false, e: false, s: false, w: false, ne: false, se: false, sw: false, nw: false, updated_at: new Date().toISOString() });
      writeNotFound(location.flightlog_id, location.name);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ Error processing ${location.name}:`, error);
    writeError(location.flightlog_id, location.name, errorMessage);
    return false;
  }
}

/**
 * Main processing function
 */
async function main() {
  console.log('Starting wind direction extraction from database...');
  console.log('================================================');

  // Initialize log files
  initializeLogFiles();

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let offset = 0;
  let hasMoreData = true;

  const maxLoops = Math.ceil(4200 / BATCH_SIZE);
  let loops = 0;

  while (hasMoreData && loops < maxLoops) {
    loops++;
    console.log(`\nFetching batch starting at offset ${offset}...`);

    const locations = await getLocationsNeedingWindDirections(BATCH_SIZE);

    if (locations.length === 0) {
      hasMoreData = false;
      console.log('No more locations to process.');
      break;
    }

    console.log(`Processing ${locations.length} locations in this batch...`);

    for (const location of locations) {
      totalProcessed++;
      const success = await processLocation(location);

      if (success) {
        totalUpdated++;
      } else {
        totalFailed++;
      }

      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    offset += BATCH_SIZE;

    // If we got fewer locations than the batch size, we're done
    if (locations.length < BATCH_SIZE) {
      hasMoreData = false;
    }

  }

  console.log('\n================================================');
  console.log('Processing completed!');
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Successfully updated: ${totalUpdated}`);
  console.log(`Failed/No data: ${totalFailed}`);
  console.log(`\nLog files created:`);
  console.log(`  Errors: ${ERROR_FILE}`);
  console.log(`  Not found: ${NOT_FOUND_FILE}`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main };
