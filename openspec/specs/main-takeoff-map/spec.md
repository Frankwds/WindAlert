# Main Takeoff Map

## Purpose

The main takeoff map is the homepage browsing experience for WindLord. It loads the curated set of active `is_main` takeoff sites together with active main weather stations, lets users narrow the visible takeoffs by wind suitability and forecast quality, and keeps the map usable as a day-to-day decision tool through persisted view state, live weather-station refreshes, and direct navigation into location details.

This capability is owned by the homepage entry point in `src/app/page.tsx`, `src/app/HomePageClient.tsx`, and the `src/app/components/GoogleMaps` stack with `variant='main'`. It depends on shared local-cache behavior, shared map-state persistence, and shared info-window coordination, but the main-map capability decides the homepage dataset scope, enabled controls, marker filtering rules, and live-refresh behavior.

## Requirements

### Requirement: Homepage map SHALL bootstrap the main browsing experience

The system SHALL render the homepage as a Google Maps experience using the main-map variant.

The homepage SHALL mount `GoogleMaps` with `variant='main'`, SHALL initialize the map from persisted map position and type when available, and SHALL expose the homepage-specific controls for fullscreen, map type, my location, layer visibility, wind filtering, and promising-weather filtering.

#### Scenario: Homepage opens the main map with main-only controls

- **GIVEN** a user opens `/`
- **WHEN** the page renders successfully
- **THEN** the homepage SHALL mount the Google Maps experience in `main` mode
- **AND** the map SHALL expose layer, wind, promising-weather, my-location, map-type, zoom, and fullscreen controls
- **AND** the map SHALL restore persisted center, zoom, map type, and fullscreen state when saved state exists

### Requirement: Homepage map SHALL fail fast when Google Maps configuration is missing

The system SHALL fail with an error state rather than a partially initialized map when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing or left at the placeholder value.

#### Scenario: Missing Google Maps configuration blocks map rendering

- **GIVEN** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing or still set to `GOOGLE_MAPS_API_KEY`
- **WHEN** the homepage attempts to initialize the map
- **THEN** the map bootstrap SHALL fail with an error state instead of rendering a partially initialized map

### Requirement: Main map SHALL load the curated takeoff dataset

The system SHALL populate the main map with active main takeoff locations.

The main map SHALL obtain its takeoff dataset through the shared local-cache capability, which decides whether a browser-local `main` dataset can be reused or must be refetched.

Main takeoffs SHALL come from `all_paragliding_locations` where `is_active=true` and `is_main=true`, with the forecast payload needed by the homepage features attached to that shared dataset.

#### Scenario: Homepage loads the main takeoff dataset

- **GIVEN** the homepage map loads successfully
- **WHEN** the main-map takeoff dataset is requested
- **THEN** the map SHALL build paragliding and landing markers from active `is_main` locations
- **AND** the loaded dataset SHALL include the forecast payload required by compact forecast rendering and promising-weather filtering

### Requirement: Main map SHALL load active main weather stations after takeoffs

The system SHALL populate the main map with active main weather stations and enrich them with their latest station readings before marker creation.

The main map SHALL obtain weather-station metadata through the shared local-cache capability, while still joining that metadata with fresh latest station readings during weather-station loads and refreshes.

Main weather stations SHALL come from `weather_stations` where `is_active=true` and `is_main=true`, and only stations that also have a latest row in `latest_station_data` SHALL be rendered.

The initial weather-station load SHALL be delayed so takeoff loading happens first.

#### Scenario: Main weather stations only appear when they have live data

- **GIVEN** the weather-station metadata includes active main stations
- **WHEN** the client combines them with the latest station-data snapshot
- **THEN** the map SHALL only create weather-station markers for stations that have a latest reading to display

### Requirement: Main map SHALL filter takeoffs by wind suitability and promising-weather rules

The system SHALL filter takeoff markers by the selected wind directions and optional promising-weather rule set.

Wind filtering SHALL use the takeoff direction flags stored on each location and SHALL support both AND and OR semantics.

The promising-weather filter SHALL exist only on the main map and SHALL evaluate forecast hours client-side using the selected day, time window, minimum consecutive hours, weather-code constraints, wind range, and gust maximum.

The promising filter day selector SHALL expose four day offsets (0–3: today plus the next three calendar days), matching `FORECAST_RANGE_DAY_COUNT`.

#### Scenario: Wind-direction filter narrows takeoffs with AND semantics

- **GIVEN** the user has enabled paragliding markers on the main map
- **AND** the user selects multiple wind directions while the compass logic is set to AND
- **WHEN** marker filtering runs
- **THEN** the map SHALL only keep takeoff markers whose direction flags satisfy every selected direction

#### Scenario: Promising filter requires consecutive valid forecast hours

- **GIVEN** the user applies a promising-weather filter for a target day and time window
- **WHEN** the map evaluates each takeoff's cached forecast data
- **THEN** the map SHALL only keep takeoff markers that contain at least the configured number of consecutive forecast hours passing the weather-code and wind or gust checks
- **AND** takeoffs without forecast data SHALL be excluded from the promising result set

### Requirement: Main map SHALL control non-takeoff overlays independently

The system SHALL let users change which marker sets are visible while leaving weather-station and landing visibility controlled by their own layer toggles.

Layer visibility toggles SHALL independently show or hide takeoffs, weather stations, landings, skyways, and thermals.

#### Scenario: Layer toggles independently control non-takeoff overlays

- **GIVEN** the user changes the layer visibility menu
- **WHEN** weather stations, landings, skyways, or thermals are toggled
- **THEN** the map SHALL update those overlays independently of the wind and promising filters applied to takeoff markers

### Requirement: Main map SHALL restore and update browsing state

The system SHALL restore the main map from persisted local state when available and SHALL keep that state synchronized with later user actions. The restored state SHALL include center, zoom, map type, layer toggles, selected wind directions, wind-filter logic, promising-filter settings, and fullscreen state. Stored wind-related filters SHALL expire after the configured time-to-live, and a stored promising filter that no longer fits the allowed time bounds SHALL be cleared before use.

#### Scenario: Saved state is still valid

- **GIVEN** the browser has previously saved main-map state that is still within the configured filter time-to-live
- **WHEN** the user returns to the homepage
- **THEN** the map SHALL restore the saved center, zoom, map type, layer visibility, wind filter, promising filter, and fullscreen preference

#### Scenario: Saved wind-related filters have expired

- **GIVEN** the browser has saved wind-direction or promising-filter selections older than the configured time-to-live
- **WHEN** the user returns to the homepage
- **THEN** the map SHALL clear those expired filter selections before rendering
- **AND** it SHALL preserve the remaining saved map settings

### Requirement: Main map SHALL open takeoff and landing marker details without leaving the homepage

The system SHALL let users inspect takeoff and landing markers from the main map without forcing navigation away from the homepage.

Main-map takeoff popups SHALL reuse the `LocationCard` variant that includes minimal hourly forecast content. When a selected takeoff has landing coordinates, the map SHALL create a landing marker aligned to that takeoff.

### Requirement: Compact forecast UI SHALL use the app forecast range and Norwegian day tabs

The system SHALL render compact hourly forecast widgets (`MinimalHourlyWeather` via `LocationCard`, and `LandingWeatherTable` in landing popups) from the cached `forecast_cache` payload loaded within the app forecast range.

Compact forecast widgets SHALL group hours by local weekday in each location's timezone through `useDataGrouping`.

Day tab labels SHALL use Norwegian three-letter weekday abbreviations (`nb-NO`, e.g. Fre, Lør, Søn, Man), matching the promising filter label style.

`MinimalHourlyWeather` SHALL show every grouped local day that has at least one forecast hour after client-side filtering, including today when only a few hours remain.

`MinimalHourlyWeather` SHALL render at most `FORECAST_RANGE_DAY_COUNT` day tabs so the compact popup layout does not exceed four tabs.

The location weather detail page uses a separate grouping rule (it may omit only the final grouped day when that day has fewer than three hours); that rule SHALL NOT be applied to compact forecast popups.

#### Scenario: Late evening still shows today's compact forecast tab

- **GIVEN** a main takeoff popup is open for a location in its stored timezone
- **AND** local time is late evening with only two future forecast hours left today
- **WHEN** `MinimalHourlyWeather` renders day tabs
- **THEN** today's tab SHALL still appear
- **AND** the hourly table SHALL list those remaining hours

#### Scenario: Compact forecast shows at most four day tabs

- **GIVEN** embedded forecast data spans the full app forecast range
- **WHEN** `MinimalHourlyWeather` renders day tabs
- **THEN** the widget SHALL show at most four day tabs
- **AND** the tabs SHALL correspond to the earliest local weekdays present in the filtered data

#### Scenario: Compact forecast day tabs use Norwegian labels

- **GIVEN** a compact forecast widget groups forecast hours by weekday
- **WHEN** day tabs are rendered
- **THEN** tab labels SHALL use Norwegian three-letter weekday abbreviations rather than browser-default English short names

#### Scenario: Selecting a main takeoff opens the forecast-rich card

- **GIVEN** the user clicks a main takeoff marker
- **WHEN** the marker click handler runs
- **THEN** the map SHALL open the main takeoff info window for that location
- **AND** if the takeoff has landing coordinates, the map SHALL create the landing marker for that takeoff before showing the popup

### Requirement: Main map SHALL open weather-station details and refresh station markers during use

The system SHALL let users inspect weather-station markers from the main map without forcing navigation away from the homepage, and SHALL keep weather-station markers fresh after the initial load.

Weather-station popups SHALL fetch station history on demand and render loading, error, or data-table states based on the result.

After the delayed initial weather-station load, the map SHALL refresh main weather-station markers on page re-visibility and on a five-minute cadence while the page remains visible, and background refresh failures SHALL leave the current markers visible.

#### Scenario: Selecting a weather station loads historical readings on demand

- **GIVEN** the user clicks a weather-station marker on the main map
- **WHEN** the station info window opens
- **THEN** the client SHALL request historical station rows for that station
- **AND** the popup SHALL render loading, error, or data-table states based on the fetch outcome

#### Scenario: Visible tab refreshes station markers on the live cadence

- **GIVEN** the main map has already loaded weather-station markers
- **AND** the tab remains visible
- **WHEN** the next scheduled live refresh occurs
- **THEN** the map SHALL reload latest weather-station data and rebuild the weather-station markers
- **AND** a refresh failure SHALL leave the current markers visible
