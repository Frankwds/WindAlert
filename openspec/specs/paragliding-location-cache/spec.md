# Paragliding Location Cache

## Purpose
This capability provides the client-side IndexedDB cache for paragliding location datasets used by the Google Maps views. It lives in `src/lib/data-cache.ts`, is read through `useParaglidingData`, and is updated by front-end contribution flows so the map can reuse previously fetched location data without waiting on Supabase every time. It owns only the cached paragliding location lists for the map variants; it does not own favourites, auth state, or the single-location weather page.

## Requirements

### Requirement: Cache map datasets by view variant
The system SHALL maintain separate cached datasets for the two map variants: a main-takeoff dataset with forecast data and an all-takeoff dataset for broad map browsing.

#### Scenario: Main map reads and fills the forecast-backed cache
- **GIVEN** the home map loads through `useParaglidingData` with the `main` variant
- **WHEN** a valid cached main dataset exists
- **THEN** the system returns the cached `ParaglidingLocationWithForecast[]` entries from IndexedDB
- **AND** it does not fetch `getAllMainLocationsWithForecast` for that load

#### Scenario: Main map populates cache after a miss
- **GIVEN** the home map loads with the `main` variant
- **WHEN** the cached main dataset is missing or invalid
- **THEN** the system fetches `all_paragliding_locations` joined with future `forecast_cache` rows through `ParaglidingLocationService.getAllMainLocationsWithForecast`
- **AND** it stores the fetched result in the main cache before returning it to marker creation

#### Scenario: All-takeoff map reads and fills the broad dataset cache
- **GIVEN** the `/locations/all` map loads through `useParaglidingData` with the `all` variant
- **WHEN** a valid cached all-location dataset exists
- **THEN** the system returns that cached array
- **AND** otherwise it fetches active locations through `ParaglidingLocationService.getAllActiveLocations` and stores that result in the all-location cache

### Requirement: Cache freshness SHALL be time-based and dataset-specific
The system SHALL treat cache freshness separately for the main and all-location datasets, and cache misses SHALL fall back to refetch instead of serving stale data.

#### Scenario: Main dataset expires after thirty minutes
- **GIVEN** the main cache contains data with a stored timestamp
- **WHEN** more than 30 minutes have elapsed since that timestamp
- **THEN** `getParaglidingLocations` returns `null`
- **AND** callers must repopulate the cache from Supabase before using the dataset

#### Scenario: All-location dataset expires after one hour
- **GIVEN** the all-location cache contains data with a stored timestamp
- **WHEN** more than 60 minutes have elapsed since that timestamp
- **THEN** `getAllParaglidingLocations` returns `null`
- **AND** callers must repopulate the cache from Supabase before using the dataset

#### Scenario: In-place cache mutations preserve dataset age
- **GIVEN** either cache already exists with a timestamp
- **WHEN** the system updates or appends location records in place after a contribution flow
- **THEN** it reuses the existing cache timestamp rather than refreshing the dataset age
- **AND** the next read still evaluates freshness against the original dataset timestamp

### Requirement: Front-end contribution flows SHALL keep cached locations in sync when possible
The system SHALL update cached paragliding location records after front-end contribution actions when a local cache is already present, and it SHOULD clear both datasets if an attempted cache update fails.

#### Scenario: Landing edits patch matching cached records
- **GIVEN** a landing update succeeds through `/api/contribute/landing`
- **WHEN** the returned location ID already exists in cached datasets
- **THEN** `updateParaglidingLocationById` merges the returned location fields into matching records in both the main and all-location caches
- **AND** if the cache write throws, the contribution flow clears both caches as a fallback

#### Scenario: Flightlog resync patches cached records without recreating forecast data
- **GIVEN** a location page resync succeeds through `/api/contribute/synchronize/[flightlog_id]`
- **WHEN** the updated location is written back to the cache
- **THEN** the cache layer merges the returned location fields into matching cached records
- **AND** it leaves any existing forecast fields untouched unless the returned object overwrites them

#### Scenario: Main-visibility changes adjust the main cache membership
- **GIVEN** an `is_main` change succeeds through `/api/contribute/is-main`
- **WHEN** the returned location is written back through `updateLocationIsMain`
- **THEN** the main cache adds or updates that record when `is_main` is `true`
- **AND** the main cache removes that record when `is_main` is `false`
- **AND** the all-location cache updates the matching record when that broader cache already exists

#### Scenario: New imports only extend caches that already exist
- **GIVEN** the standalone contribute page successfully imports a location from Flightlog
- **WHEN** it calls `addParaglidingLocationIfCacheExists`
- **THEN** the system updates or appends the imported location only in cache datasets that already exist and contain array data
- **AND** it does not create a new cache dataset solely because an import succeeded

### Requirement: Cache storage failures SHALL degrade without blocking the UI flow
The system SHALL treat this cache as an opportunistic client-side optimization rather than a required persistence layer.

#### Scenario: Cache reads fail in unsupported or broken storage environments
- **GIVEN** the code runs on the server or IndexedDB access fails in the browser
- **WHEN** a cache read is attempted
- **THEN** the cache layer returns `null` instead of throwing to the caller
- **AND** the caller continues by fetching fresh data from Supabase

#### Scenario: Cache writes fail during a contribution flow
- **GIVEN** a contribution action has already succeeded against the server
- **WHEN** the follow-up cache update fails
- **THEN** the user-visible contribution flow continues
- **AND** the client clears both cached datasets so later map loads refetch authoritative data

#### Scenario: Cache clearing removes both map datasets
- **GIVEN** `clearCache` is invoked
- **WHEN** the IndexedDB transaction succeeds
- **THEN** the system deletes both the main-takeoff cache entry and the all-location cache entry from the shared `WindLordCache` database