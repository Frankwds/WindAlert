#!/usr/bin/env tsx

// Load environment variables from .env files
import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { batchImportAllKmlData } from './batch_step_2_import_kml.js';

async function main() {
  try {
    console.log('🚀 Starting batch paragliding locations import from fixed KML files...\n');

    // Define the directory containing fixed KML files
    const fixedKmlDir = path.join(process.cwd(), 'data', 'utlandet_kml_fixed');

    if (!fs.existsSync(fixedKmlDir)) {
      console.error(`❌ Fixed KML directory not found at: ${fixedKmlDir}`);
      console.log('Please ensure the utlandet_kml_fixed directory exists.');
      process.exit(1);
    }

    // Get all fixed KML files - FOR TESTING: only process country ID 13 (Australia)
    const kmlFiles = fs.readdirSync(fixedKmlDir)
      .filter(file => file.endsWith('_fixed.kml'))
      .map(file => path.join(fixedKmlDir, file));

    if (kmlFiles.length === 0) {
      console.error('❌ No fixed KML files found in the directory');
      process.exit(1);
    }

    console.log(`📁 Found ${kmlFiles.length} fixed KML files to process`);
    console.log(`📂 Directory: ${fixedKmlDir}\n`);

    // Display files that will be processed
    console.log('Files to be processed:');
    kmlFiles.forEach((file, index) => {
      const filename = path.basename(file);
      const countryId = filename.replace('country_', '').replace('_fixed.kml', '');
      console.log(`  ${index + 1}. ${filename} (Country ID: ${countryId})`);
    });

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(`\nDo you want to proceed with importing locations from ${kmlFiles.length} KML files? (y/N): `, resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Import cancelled by user');
      process.exit(0);
    }

    // Start batch import
    console.log('\n🔄 Starting batch import process...\n');

    const startTime = Date.now();
    const results = await batchImportAllKmlData(kmlFiles, 50);
    const endTime = Date.now();

    // Display results
    console.log('\n📊 Batch Import Results:');
    console.log('========================');
    console.log(`Total files processed: ${results.totalFiles}`);
    console.log(`Total locations found: ${results.totalLocations}`);
    console.log(`Successfully imported: ${results.imported}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.slice(0, 10).forEach((error: string, index: number) => {
        console.log(`${index + 1}. ${error}`);
      });

      if (results.errors.length > 10) {
        console.log(`... and ${results.errors.length - 10} more errors`);
      }
    }

    if (results.imported > 0) {
      console.log(`\n✅ Successfully imported ${results.imported} paragliding locations from ${results.totalFiles} files!`);
      console.log('You can now use the ParaglidingLocationService to query the data.');
    }

  } catch (error) {
    console.error('\n💥 Batch import failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Batch Paragliding Locations Import Script

Usage:
  tsx scripts/batch_step_1_import_kml.ts [options]

Options:
  --help, -h    Show this help message

Description:
  This script imports paragliding and hang gliding locations from all fixed KML files
  in the utlandet_kml_fixed directory into your Supabase database. It will:

  1. Find all _fixed.kml files in the data/utlandet_kml_fixed directory
  2. Extract country information from the filename (country_XXX_fixed.kml)
  3. Parse each KML file to extract location data
  4. Convert coordinates and extract basic metadata
  5. Import locations in batches for better performance
  6. Handle duplicates using flightlog IDs
  7. Provide detailed import results

Prerequisites:
  - Supabase database must be set up with the paragliding_locations table
  - Environment variables must be configured for Supabase connection
  - Fixed KML files must exist in the data/utlandet_kml_fixed directory

Example:
  tsx scripts/batch_step_1_import_kml.ts
`);
  process.exit(0);
}

// Run the import
main().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
