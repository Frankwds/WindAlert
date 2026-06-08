# Local Cache

This capability documents the browser-local cache behavior used to reduce repeated network reads for map data. It is implemented primarily in `src/lib/data-cache.ts` and is read through `useParaglidingData` and `useWeatherStationData` in the shared Google Maps stack.

This capability owns the IndexedDB-backed `WindLordCache` datasets for paragliding locations and weather-station metadata, the cache-coherency rules applied after client-side location mutations, and the graceful fallback behavior when browser storage cannot be used.

This capability does not own durable `localStorage` or `sessionStorage` state such as map-state persistence, theme preference, onboarding interactions, or auth redirect paths. It also does not own the request-scoped React `cache()` wrapper used by the single-location page metadata path.

Operational context:

- The shared IndexedDB database is `WindLordCache` with a single `cache` object store.
- The cache holds four browser-local entries: `windlord_cache_paragliding`, `windlord_cache_all_paragliding`, `windlord_cache_main_weather_stations`, and `windlord_cache_all_weather_stations`.
- The forecast-backed main takeoff dataset is sourced from `ParaglidingLocationService.getAllMainLocationsWithForecast`, which embeds only future `forecast_cache` rows within the app forecast range.
- The broad all-takeoff dataset is sourced from `ParaglidingLocationService.getAllActiveLocations` and does not include the main-map forecast payload.

## Requirements

### Requirement: Paragliding map datasets SHALL be cached by variant in browser-local IndexedDB

The system SHALL maintain separate browser-local paragliding datasets for the `main` and `all` Google Maps variants.

The `main` dataset SHALL cache the forecast-backed takeoff payload returned by `getAllMainLocationsWithForecast`.

The `all` dataset SHALL cache the broader takeoff payload returned by `getAllActiveLocations`.

#### Scenario: First main-map request writes the forecast-backed dataset

- **GIVEN** a browser user opens the homepage map and no cached `main` dataset exists
- **WHEN** the map requests paragliding data through `useParaglidingData`
- **THEN** the system SHALL fetch `getAllMainLocationsWithForecast`
- **AND** it SHALL write that returned dataset to `windlord_cache_paragliding`
- **AND** that fetch SHALL be the event that creates forecast-backed takeoff traffic for that user

#### Scenario: Valid cached main dataset avoids another forecast-backed fetch

- **GIVEN** a valid cached `main` dataset already exists in IndexedDB
- **WHEN** the homepage map requests paragliding data again before that cache expires
- **THEN** the system SHALL reuse the cached `main` dataset
- **AND** it SHALL not call `getAllMainLocationsWithForecast` for that load

#### Scenario: All-takeoff map uses the broad dataset path instead of the forecast-backed one

- **GIVEN** a browser user opens `/locations/all`
- **WHEN** the all-map variant requests paragliding data
- **THEN** the system SHALL read or populate `windlord_cache_all_paragliding`
- **AND** any refetch SHALL use `getAllActiveLocations` instead of `getAllMainLocationsWithForecast`

### Requirement: Cache freshness SHALL be entry-specific and demand-driven

The system SHALL evaluate freshness independently for each IndexedDB entry.

The forecast-backed `main` paragliding dataset SHALL expire after 30 minutes.

The broad `all` paragliding dataset SHALL expire after 60 minutes.

The weather-station metadata entries for `main` and `all` SHALL expire after 12 hours.

Expiry SHALL not trigger background refetch by itself. A stale entry SHALL only be refetched when some later read attempts to use that entry.

#### Scenario: Expired main dataset refetches only on a later read

- **GIVEN** a cached `main` paragliding dataset is older than 30 minutes
- **WHEN** the homepage map next requests paragliding data
- **THEN** `getParaglidingLocations` SHALL return `null`
- **AND** the system SHALL refetch `getAllMainLocationsWithForecast` before building takeoff markers

#### Scenario: Expired all-location dataset refetches only on a later read

- **GIVEN** a cached `all` paragliding dataset is older than 60 minutes
- **WHEN** the all-takeoff map next requests paragliding data
- **THEN** `getAllParaglidingLocations` SHALL return `null`
- **AND** the system SHALL refetch `getAllActiveLocations` before building takeoff markers

#### Scenario: Staying on the main map does not poll the paragliding cache

- **GIVEN** the homepage map has already loaded paragliding and landing markers from cached or freshly fetched `main` data
- **WHEN** the user keeps that page open without clearing cache or remounting the takeoff dataset
- **THEN** the system SHALL not schedule interval-based or visibility-based refetches of `getAllMainLocationsWithForecast`
- **AND** keeping the tab open by itself SHALL not create additional forecast-backed takeoff traffic

### Requirement: Weather-station metadata SHALL be cached separately from latest observations

The system SHALL cache weather-station metadata by map variant in IndexedDB while continuing to fetch latest station observations from Supabase each time weather-station data is loaded or refreshed.

The cached weather-station entries SHALL hold metadata from `WeatherStationService.getAllActive`.

The latest observation snapshot SHALL come from `StationDataService.getLatestStationData` and SHALL be joined with cached or freshly fetched metadata before marker creation.

Only stations that have a latest observation row SHALL remain in the combined marker dataset.

#### Scenario: Cached station metadata still uses fresh latest observations

- **GIVEN** valid cached weather-station metadata exists for the current map variant
- **WHEN** `useWeatherStationData` loads weather-station data
- **THEN** the system SHALL reuse cached metadata from IndexedDB
- **AND** it SHALL still fetch the latest station observations from the corresponding latest-station view
- **AND** it SHALL only keep stations that have a latest observation to display

#### Scenario: Missing station metadata fetches metadata and latest observations together

- **GIVEN** no valid cached weather-station metadata exists for the current map variant
- **WHEN** `useWeatherStationData` loads weather-station data
- **THEN** the system SHALL fetch weather-station metadata and latest observations in parallel
- **AND** it SHALL write only the metadata dataset to the variant-specific weather-station cache entry
- **AND** it SHALL return the combined stations-with-latest-data result to marker creation

#### Scenario: Expired weather-station metadata refetches on demand

- **GIVEN** a cached weather-station metadata entry is older than 12 hours
- **WHEN** a later weather-station load requests that variant's metadata
- **THEN** `getWeatherStations` SHALL return `null`
- **AND** the system SHALL refetch weather-station metadata before combining it with fresh latest observations

### Requirement: Successful client-side location mutations SHALL preserve cache coherence when possible

The system SHALL update existing paragliding cache datasets in place after successful client-side location mutations when the affected browser-local cache entry already exists.

In-place cache mutations SHALL reuse the original dataset timestamp rather than extending the entry's freshness window.

Standalone import flows SHALL only append to paragliding cache entries that already exist and contain array data.

An `is_main` mutation SHALL update `main` cache membership as well as the matching record in the broader `all` dataset when that broader dataset exists.

#### Scenario: Landing edits patch matching cached records without refreshing dataset age

- **GIVEN** a landing update succeeds and a matching paragliding cache entry already exists
- **WHEN** the client applies `updateParaglidingLocationById`
- **THEN** the system SHALL merge the returned location fields into matching records in the existing cache entries
- **AND** it SHALL preserve the original cache timestamp for those entries

#### Scenario: Flightlog resync patches cached location records in place

- **GIVEN** a location synchronization succeeds and a matching paragliding cache entry already exists
- **WHEN** the client applies `updateParaglidingLocationById`
- **THEN** the system SHALL merge the returned location fields into matching cached records
- **AND** it SHALL leave the entry freshness window anchored to the original cache timestamp

#### Scenario: Main-visibility changes update main-cache membership

- **GIVEN** an `is_main` mutation succeeds and the browser already has paragliding cache data
- **WHEN** the client applies `updateLocationIsMain`
- **THEN** the `main` cache SHALL add or update the location when `is_main` is `true`
- **AND** the `main` cache SHALL remove the location when `is_main` is `false`
- **AND** the broader `all` cache SHALL update the matching location record when that cache exists

#### Scenario: Standalone imports only extend caches that already exist

- **GIVEN** the standalone contribute page successfully imports a location from Flightlog
- **WHEN** the client applies `addParaglidingLocationIfCacheExists`
- **THEN** the system SHALL update or append the imported location only in cache entries that already exist and contain array data
- **AND** it SHALL not create a new paragliding cache dataset solely because an import succeeded

### Requirement: Cache failures and resets SHALL degrade without blocking the UI flow

The system SHALL treat the browser-local cache as an opportunistic optimization rather than required persistence.

If IndexedDB access is unavailable, unsupported, or fails during reads, callers SHALL fall back to fresh network reads instead of crashing.

If a targeted cache mutation cannot preserve coherent cached data after a successful server-side mutation, the client SHALL clear the affected shared cache entries rather than leaving stale map data in place.

Clearing the shared map cache SHALL remove the `main` and `all` paragliding entries and the `main` and `all` weather-station metadata entries from the shared IndexedDB database.

#### Scenario: Cache reads fail and the caller refetches authoritative data

- **GIVEN** the code runs outside the browser or IndexedDB access fails during a cache read
- **WHEN** a map data load attempts to read browser-local cached data
- **THEN** the cache layer SHALL return `null` instead of throwing to the caller
- **AND** the caller SHALL continue by fetching authoritative data from Supabase

#### Scenario: Cache mutation failure clears the shared map cache

- **GIVEN** a contribution or import action has already succeeded against the server
- **WHEN** the follow-up browser-local cache mutation throws or cannot preserve coherent cached data
- **THEN** the client SHALL clear the shared map cache entries instead of keeping stale cached datasets
- **AND** the user-visible contribution flow SHALL continue with its success path

#### Scenario: Clear-cache removes all IndexedDB-backed map datasets

- **GIVEN** `clearCache` is invoked successfully in the browser
- **WHEN** the IndexedDB delete transaction completes
- **THEN** the system SHALL delete `windlord_cache_paragliding`, `windlord_cache_all_paragliding`, `windlord_cache_main_weather_stations`, and `windlord_cache_all_weather_stations`
