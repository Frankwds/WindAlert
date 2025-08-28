// #!/usr/bin/env tsx

// // Load environment variables from .env files
// import 'dotenv/config';

// import fs from 'fs';
// import path from 'path';
// import { batchImportStationData } from './importStationData';

// async function main() {
//   try {
//     console.log('🚀 Starting weather stations import...\n');

//     // Read the station files
//     const stationsPath = path.join(process.cwd(), 'data', 'stations.txt');
//     const coordinatesPath = path.join(process.cwd(), 'data', 'stationsCoordinates.txt');

//     if (!fs.existsSync(stationsPath)) {
//       console.error(`❌ Stations file not found at: ${stationsPath}`);
//       console.log('Please ensure the stations.txt file exists in the data directory.');
//       process.exit(1);
//     }

//     if (!fs.existsSync(coordinatesPath)) {
//       console.error(`❌ Station coordinates file not found at: ${coordinatesPath}`);
//       console.log('Please ensure the stationsCoordinates.txt file exists in the data directory.');
//       process.exit(1);
//     }

//     console.log(`📁 Reading stations file: ${stationsPath}`);
//     console.log(`📁 Reading coordinates file: ${coordinatesPath}`);

//     const stationsContent = fs.readFileSync(stationsPath, 'utf-8');
//     const coordinatesContent = fs.readFileSync(coordinatesPath, 'utf-8');

//     // Parse and display basic info
//     const stationLines = stationsContent.split('\n').filter(line => line.trim());
//     const coordinateLines = coordinatesContent.split('\n').filter(line => line.trim());

//     console.log(`📍 Found ${stationLines.length} stations in stations.txt`);
//     console.log(`📍 Found ${coordinateLines.length} coordinate entries in stationsCoordinates.txt\n`);

//     // Ask for confirmation
//     const readline = require('readline');
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     });

//     const answer = await new Promise<string>((resolve) => {
//       rl.question(`Do you want to proceed with importing ${stationLines.length} weather stations? (y/N): `, resolve);
//     });

//     rl.close();

//     if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
//       console.log('❌ Import cancelled by user');
//       process.exit(0);
//     }

//     // Start import
//     console.log('\n🔄 Starting import process...\n');

//     const startTime = Date.now();
//     const results = await batchImportStationData(stationsContent, coordinatesContent, 50);
//     const endTime = Date.now();

//     // Display results
//     console.log('\n📊 Import Results:');
//     console.log('==================');
//     console.log(`Total stations found: ${results.total}`);
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
//       console.log(`\n✅ Successfully imported ${results.imported} weather stations!`);
//       console.log('You can now use the WeatherStationService to query the data.');
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
// Weather Stations Import Script

// Usage:
//   tsx scripts/import-weather-stations.ts [options]

// Options:
//   --help, -h    Show this help message

// Description:
//   This script imports weather stations from the stations.txt and stationsCoordinates.txt files
//   into your Supabase database. It will:

//   1. Parse the station names and coordinates files
//   2. Match stations with their coordinates
//   3. Import stations in batches for better performance
//   4. Handle duplicates using station IDs
//   5. Provide detailed import results

// Prerequisites:
//   - Supabase database must be set up with the weather_stations table
//   - Environment variables must be configured for Supabase connection
//   - Station files must exist in the data/ directory

// Example:
//   tsx scripts/import-weather-stations.ts
// `);
//   process.exit(0);
// }

// // Run the import
// main().catch((error) => {
//   console.error('💥 Unhandled error:', error);
//   process.exit(1);
// });
