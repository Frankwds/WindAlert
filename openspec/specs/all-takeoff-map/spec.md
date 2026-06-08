# All Takeoff Map

## Purpose

The all takeoff map is WindLord's broad discovery map at `/locations/all`. It loads the full set of active takeoff sites instead of only curated main sites, combines them with active weather stations that have live readings, and helps users scan the larger catalog through wind-direction filtering, layer toggles, shared map controls, and direct links out to location pages and external weather tools.

This capability is owned by `src/app/(pages)/locations/all/page.tsx` and the shared `src/app/components/GoogleMaps` stack when it runs with `variant='all'`. It depends on shared local-cache behavior, shared map-state persistence, and shared info-window coordination, but the all-map capability decides the broader dataset scope, lighter popup content, looser clustering, and the absence of the main-map promising-weather filter.

## Requirements

### Requirement: All-locations page SHALL bootstrap the broad browsing map

The system SHALL render `/locations/all` as the `all` variant of the Google Maps experience, initialize the map from persisted map position and type when available, and expose the all-map control set for fullscreen, map type, my location, layer visibility, and wind-direction filtering.

The all-map variant SHALL mount `GoogleMaps` with `variant='all'`, SHALL restore fullscreen from persisted map state, and SHALL fail with an error state rather than a partially initialized map when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing or left at the placeholder value.

The all-map variant SHALL NOT expose the promising-weather control that exists on the homepage map, and it SHALL use the broader paragliding clustering configuration for its takeoff markers.

#### Scenario: User opens the all-takeoff map

- **GIVEN** a user opens `/locations/all`
- **WHEN** the page renders successfully
- **THEN** it SHALL mount the Google Maps experience in `all` mode
- **AND** the map SHALL expose layer, wind, my-location, map-type, zoom, and fullscreen controls
- **AND** it SHALL not render the promising-weather filter control

#### Scenario: All-map takeoff clustering uses the broad configuration

- **GIVEN** the all-takeoff map renders paragliding markers
- **WHEN** the map builds the takeoff clusterer
- **THEN** it SHALL use the all-map clustering radius instead of the tighter main-map radius

### Requirement: All map SHALL load all active takeoffs and all active weather stations

The system SHALL populate the all map with the full active takeoff catalog and the full active weather-station catalog.

The all-map takeoff dataset and weather-station metadata SHALL be obtained through the shared local-cache capability, which decides whether cached browser-local entries can be reused or must be refetched.

All takeoffs SHALL come from `all_paragliding_locations` where `is_active=true`, using the paginated `getAllActiveLocations()` path rather than the main-only forecast query. Those records SHALL include site metadata, direction flags, main-map membership, landing coordinates, and timezone data, but they SHALL not include the main-map forecast payload.

All weather stations SHALL come from `weather_stations` where `is_active=true`. When the all map requests weather-station metadata with `isMain=false`, the station query SHALL not apply the `is_main=true` filter, and only stations that also have a latest row in `latest_station_data` SHALL become markers.

#### Scenario: All-map requests the broad takeoff dataset

- **GIVEN** the all-takeoff map loads successfully
- **WHEN** the all-map takeoff dataset is requested
- **THEN** the map SHALL build paragliding and landing markers from active takeoff rows returned through the broad paginated dataset path
- **AND** that loaded dataset SHALL not include the main-map forecast payload

#### Scenario: All weather stations only appear when they have live data

- **GIVEN** the weather-station metadata includes active stations outside and inside the curated main subset
- **WHEN** the client combines those stations with the latest station-data snapshot
- **THEN** the all map SHALL create markers for every active station that has a latest reading
- **AND** it SHALL omit stations that do not have current station data to display

### Requirement: All map SHALL filter visible markers by layer visibility and wind suitability only

The system SHALL let users change which marker sets are visible and SHALL filter takeoff markers by the selected wind directions, while leaving weather-station and landing visibility controlled by their own layer toggles.

Layer visibility toggles SHALL independently show or hide takeoffs, weather stations, landings, skyways, and thermals. Wind filtering SHALL use the takeoff direction flags stored on each location and SHALL support both AND and OR semantics.

The all-map variant SHALL not offer or apply the promising-weather filter. When the shared map state is synchronized from the all-map variant, it SHALL persist `promisingFilter: null` instead of restoring or saving a promising filter selection for this variant.

#### Scenario: Wind-direction filter narrows all-map takeoffs with OR logic

- **GIVEN** the user has enabled paragliding markers on the all map
- **AND** the user selects multiple wind directions while the compass logic is set to OR
- **WHEN** marker filtering runs
- **THEN** the map SHALL keep takeoff markers whose direction flags satisfy at least one selected direction

#### Scenario: Layer toggles independently control non-takeoff overlays

- **GIVEN** the user changes the layer visibility menu on the all map
- **WHEN** weather stations, landings, skyways, or thermals are toggled
- **THEN** the map SHALL update those overlays independently of the wind filter applied to takeoff markers

#### Scenario: All-map persistence clears shared promising-filter state

- **GIVEN** the shared persisted map state currently contains a promising filter from the main map
- **WHEN** the all-takeoff map initializes and writes its filter state
- **THEN** the all-map variant SHALL persist the common layer and wind settings
- **AND** it SHALL store the promising-filter field as `null` for that write

### Requirement: All map SHALL restore and update broad browsing state

The system SHALL restore the all map from persisted local state when available and SHALL keep that state synchronized with later user actions.

The restored state SHALL include center, zoom, map type, layer toggles, selected wind directions, wind-filter logic, and fullscreen state. Stored wind-direction filters SHALL expire after the configured time-to-live, and expired state clearing SHALL preserve the remaining saved map settings.

The all-map variant SHALL update persisted state when the user pans or zooms the map, changes map type, changes layer visibility, changes wind selections, or toggles fullscreen.

#### Scenario: Saved all-map state is still valid

- **GIVEN** the browser has previously saved map state that is still within the configured filter time-to-live
- **WHEN** the user returns to `/locations/all`
- **THEN** the map SHALL restore the saved center, zoom, map type, layer visibility, wind filter, and fullscreen preference

#### Scenario: Saved wind filters have expired on the all map

- **GIVEN** the browser has saved wind-direction selections older than the configured time-to-live
- **WHEN** the user returns to `/locations/all`
- **THEN** the map SHALL clear those expired wind-direction selections before rendering
- **AND** it SHALL preserve the remaining saved map settings

### Requirement: All map SHALL open link-focused marker details and keep weather stations fresh during use

The system SHALL let users inspect takeoff, landing, and weather-station markers from the all map without forcing navigation away from `/locations/all`, and SHALL keep weather-station markers fresh after the initial load.

All-map takeoff popups SHALL reuse the `LocationCardAll` variant, which links to the location page and external weather tools instead of showing the main-map compact forecast summary. When a selected takeoff has landing coordinates, the map SHALL create a landing marker aligned to that takeoff.

Landing popups SHALL show landing metadata and external links, and they SHALL only render landing forecast content when the loaded location data carries forecast rows. Weather-station popups SHALL fetch station history on demand and render loading, error, or data-table states based on the result.

After the delayed initial weather-station load, the all map SHALL refresh weather-station markers on page re-visibility and on a five-minute cadence while the page remains visible, and background refresh failures SHALL leave the current markers visible.

#### Scenario: Selecting an all-map takeoff opens the link-focused card

- **GIVEN** the user clicks a takeoff marker on the all map
- **WHEN** the marker click handler runs
- **THEN** the map SHALL open the all-map takeoff info window for that location
- **AND** the popup SHALL show the location page link and external weather links instead of the main-map compact forecast card
- **AND** if the takeoff has landing coordinates, the map SHALL create the landing marker for that takeoff before showing the popup

#### Scenario: Selecting a weather station loads historical readings on demand

- **GIVEN** the user clicks a weather-station marker on the all map
- **WHEN** the station info window opens
- **THEN** the client SHALL request historical station rows for that station
- **AND** the popup SHALL render loading, error, or data-table states based on the fetch outcome

#### Scenario: Visible tab refreshes all-map station markers on the live cadence

- **GIVEN** the all map has already loaded weather-station markers
- **AND** the tab remains visible
- **WHEN** the next scheduled live refresh occurs
- **THEN** the map SHALL reload latest weather-station data and rebuild the weather-station markers
- **AND** a refresh failure SHALL leave the current markers visible
