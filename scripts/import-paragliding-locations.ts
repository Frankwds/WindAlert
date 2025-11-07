// #!/usr/bin/env tsx

// // Load environment variables from .env files

// import 'dotenv/config';

// import fs from 'fs';
// import path from 'path';
// import { batchImportKmlData } from './importKmlData';

// async function main() {
//   try {
//     console.log('🚀 Starting paragliding locations import...\n');

//     // Read the KML file
//     const kmlPath = path.join(process.cwd(), 'data', 'paraglidingSpots.kml');

//     if (!fs.existsSync(kmlPath)) {
//       console.error(`❌ KML file not found at: ${kmlPath}`);
//       console.log('Please ensure the KML file exists in the data directory.');
//       process.exit(1);
//     }

//     console.log(`📁 Reading KML file: ${kmlPath}`);
//     const kmlContent = fs.readFileSync(kmlPath, 'utf-8');

//     // Parse and display basic info
//     const placemarkRegex = /<Placemark>/g;
//     const totalPlacemarks = (kmlContent.match(placemarkRegex) || []).length;

//     console.log(`📍 Found ${totalPlacemarks} placemarks in KML file\n`);

//     // Ask for confirmation
//     const readline = require('readline');
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     });

//     const answer = await new Promise<string>((resolve) => {
//       rl.question(`Do you want to proceed with importing ${totalPlacemarks} locations? (y/N): `, resolve);
//     });

//     rl.close();

//     if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
//       console.log('❌ Import cancelled by user');
//       process.exit(0);
//     }

//     // Start import
//     console.log('\n🔄 Starting import process...\n');

//     const startTime = Date.now();
//     const results = await batchImportKmlData(kmlContent, 50);
//     const endTime = Date.now();

//     // Display results
//     console.log('\n📊 Import Results:');
//     console.log('==================');
//     console.log(`Total locations found: ${results.total}`);
//     console.log(`Successfully imported: ${results.imported}`);
//     console.log(`Errors: ${results.errors.length}`);
//     console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);

//     if (results.errors.length > 0) {
//       console.log('\n❌ Errors encountered:');
//       results.errors.slice(0, 10).forEach((error, index) => {
//         console.log(`${index + 1}. ${error}`);
//       });

//       if (results.errors.length > 10) {
//         console.log(`... and ${results.errors.length - 10} more errors`);
//       }
//     }

//     if (results.imported > 0) {
//       console.log(`\n✅ Successfully imported ${results.imported} paragliding locations!`);
//       console.log('You can now use the ParaglidingLocationService to query the data.');
//     }

//   } catch (error) {
//     console.error('\n💥 Import failed:', error);
//     process.exit(1);
//   }
// }

// // Handle command line arguments
// const args = process.argv.slice(2);
// if (args.includes('--help') || args.includes('-h')) {
//   console.log(`
// Paragliding Locations Import Script

// Usage:
//   tsx scripts/import-paragliding-locations.ts [options]

// Options:
//   --help, -h    Show this help message

// Description:
//   This script imports paragliding and hang gliding locations from the KML file
//   into your Supabase database. It will:

//   1. Parse the KML file to extract location data
//   2. Convert coordinates and extract basic metadata
//   3. Import locations in batches for better performance
//   4. Handle duplicates using flightlog IDs
//   5. Provide detailed import results

// Prerequisites:
//   - Supabase database must be set up with the paragliding_locations table
//   - Environment variables must be configured for Supabase connection
//   - KML file must exist in the data/ directory

// Example:
//   tsx scripts/import-paragliding-locations.ts
// `);
//   process.exit(0);
// }

// // Run the import
// main().catch((error) => {
//   console.error('💥 Unhandled error:', error);
//   process.exit(1);
// });
