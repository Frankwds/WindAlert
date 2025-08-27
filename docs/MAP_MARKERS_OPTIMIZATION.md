# Map Markers Optimization - Database-Driven Approach

## Overview

WindAlert has been updated to use a database-driven approach for map markers instead of loading all data at once. This provides significant performance improvements and scalability for applications with thousands of locations.

## Key Features

### 1. Bounds-Based Loading
- **Dynamic Loading**: Markers are loaded only for the current map viewport
- **Efficient Queries**: Uses database bounds filtering instead of client-side filtering
- **Real-time Updates**: Markers update automatically when the user pans/zooms the map

### 2. Performance Optimizations
- **Debounced Loading**: Prevents excessive API calls during map interactions
- **Idle Event Handling**: Uses Google Maps 'idle' event for optimal performance
- **Concurrent Fetching**: Fetches paragliding locations and weather stations simultaneously
- **Marker Cleanup**: Properly removes old markers before adding new ones

### 3. User Experience Improvements
- **Loading Indicators**: Shows when new markers are being fetched
- **Marker Counts**: Displays current view vs. total database counts
- **Percentage Display**: Shows what portion of total data is currently visible

## Database Structure

### Required Columns
Both `paragliding_locations` and `weather_stations` tables require:
- `latitude` (numeric)
- `longitude` (numeric) 
- `is_active` (boolean)

### Recommended Indexes
Run the following SQL in your Supabase SQL editor:

```sql
-- Paragliding locations optimization
CREATE INDEX IF NOT EXISTS idx_paragliding_locations_bounds 
ON paragliding_locations (is_active, latitude, longitude) 
WHERE is_active = true;

-- Weather stations optimization  
CREATE INDEX IF NOT EXISTS idx_weather_stations_bounds 
ON weather_stations (is_active, latitude, longitude) 
WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;
```

## How It Works

### 1. Initial Load
- Map loads with initial viewport
- Fetches markers within initial bounds
- Loads total database counts for reference

### 2. Dynamic Updates
- User pans/zooms the map
- Map fires 'idle' event when user stops moving
- New bounds are calculated with 10% padding
- Old markers are cleared
- New markers are fetched and displayed

### 3. Bounds Calculation
```typescript
// Add padding to avoid markers disappearing at edges
const padding = 0.1; // 10% padding
const latPadding = (ne.lat() - sw.lat()) * padding;
const lngPadding = (ne.lng() - sw.lng()) * padding;

const north = ne.lat() + latPadding;
const south = sw.lat() - latPadding;
const east = ne.lng() + lngPadding;
const west = sw.lng() - lngPadding;
```

## Performance Benefits

### Before (Mock Data)
- All markers loaded at once
- Memory usage scales with total data size
- Initial load time increases with data size
- No optimization for large datasets

### After (Database-Driven)
- Only visible markers loaded
- Memory usage remains constant
- Initial load time remains fast
- Scales to millions of locations

## Configuration

### Environment Variables
Ensure your Supabase credentials are properly configured in your environment.

### Rate Limiting
The system includes built-in protection:
- 300ms debouncing for bounds changes
- 1000 marker limit per query
- Error handling for failed requests

## Future Enhancements

### 1. PostGIS Integration
For even better spatial performance, consider adding PostGIS:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX idx_locations_spatial 
ON paragliding_locations USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));
```

### 2. Clustering
For very dense marker areas, implement marker clustering:
- Group nearby markers into clusters
- Show cluster counts
- Expand clusters on zoom

### 3. Caching
Implement client-side caching for recently viewed areas:
- Cache marker data for common viewports
- Reduce redundant API calls
- Improve user experience for repeated navigation

## Troubleshooting

### Common Issues

1. **No markers appearing**
   - Check database connection
   - Verify `is_active` flags
   - Check coordinate data validity

2. **Performance issues**
   - Ensure indexes are created
   - Check query execution plans
   - Monitor database response times

3. **Markers not updating**
   - Check browser console for errors
   - Verify event listeners are attached
   - Check network requests in DevTools

### Debug Mode
Enable debug logging by checking the browser console for:
- Bounds calculation details
- API request/response data
- Marker creation/cleanup logs

## Monitoring

### Key Metrics to Watch
- Marker load times
- Database query performance
- Memory usage
- User interaction responsiveness

### Performance Targets
- Initial marker load: < 500ms
- Bounds change response: < 300ms
- Memory usage: < 50MB regardless of data size
