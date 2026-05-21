# Location Weather Page

## Purpose
The location weather page presents one paragliding takeoff as a shareable, route-addressable detail page at `src/app/(pages)/locations/[flightlog_id]`. It combines location metadata from Supabase with live forecast data from Open-Meteo and YR, evaluates flying suitability for each forecast hour, and renders the result as a page-oriented experience with route metadata, a location header, grouped forecast details, and a Windy embed.

This capability owns the detail-page route, the forecast shaping pipeline, and the route-level SEO metadata in `src/app/(pages)/locations/[flightlog_id]/layout.tsx`, `page.tsx`, `metadata.ts`, `locationSeo.ts`, and `locationPageCache.ts`. It composes, but does not own, favourite persistence and contribution mutations: the page embeds `FavouriteHeart` and `Contribute`, while the underlying favourite and contribution behaviors belong to separate capabilities.

## Ownership and Boundaries
- Route entry points: `src/app/(pages)/locations/[flightlog_id]/layout.tsx` and `src/app/(pages)/locations/[flightlog_id]/page.tsx`
- Forecast shaping: `src/lib/openMeteo/*`, `src/lib/yr/*`, `src/lib/utils/combineData.ts`, `src/lib/utils/validateDataPoint.ts`, and `src/app/(pages)/locations/utils/utils.ts`
- Primary rendering surfaces: `src/app/components/LocationPage/LocationHeader.tsx`, `src/app/components/LocationPage/WeatherTable/*`, and `src/app/components/LocationPage/windyWidget.tsx`
- Data source for the route record: `ParaglidingLocationService.getByFlightlogId()` against `all_paragliding_locations`
- Front-end-facing YR adapter: `src/app/api/yr/route.ts`

## Requirements

### Requirement: The route SHALL resolve a location by Flightlog identifier and publish route metadata from that record
The system SHALL treat the `[flightlog_id]` route segment as the canonical identifier for a location detail page.

The route SHALL load the location record from `all_paragliding_locations` through `ParaglidingLocationService.getByFlightlogId()` for both page content and route metadata.

The route SHALL generate a canonical location URL, social metadata, and JSON-LD structured data when the location exists.

If the location cannot be resolved, the route SHALL avoid indexing that page and SHALL stop normal page rendering rather than showing a stale or guessed location.

#### Scenario: Existing location gets metadata and JSON-LD
- **GIVEN** a request for `/locations/<flightlog_id>` where the location exists in `all_paragliding_locations`
- **WHEN** the route layout and metadata functions run
- **THEN** the system generates page metadata from the stored location record
- **AND** the route emits JSON-LD describing the location and page relationship
- **AND** the canonical URL points to `/locations/<flightlog_id>`

#### Scenario: Missing location is not indexed
- **GIVEN** a request for `/locations/<flightlog_id>` where no location record is returned
- **WHEN** metadata is generated
- **THEN** the system returns fallback metadata that disables indexing
- **AND** the page does not render a normal location detail view

### Requirement: The page SHALL build its hourly forecast by combining Open-Meteo atmospheric data with YR surface data
The system SHALL fetch the location-specific forecast after the location record has been loaded.

The system SHALL fetch Open-Meteo data directly from the browser using the Open-Meteo forecast endpoint and SHALL fetch YR data through the application route at `src/app/api/yr/route.ts` so the request includes the required server-controlled `User-Agent`.

The system SHALL validate and map the Open-Meteo response before merging it with YR hourly data.

When a YR hourly data point matches an Open-Meteo hour, the system SHALL prefer YR values for surface-level fields such as temperature, wind, gusts, precipitation, pressure, weather symbol, and daytime state, while preserving Open-Meteo upper-air and atmospheric fields.

If a YR hour is unavailable, the system SHALL still return an hourly forecast entry built from Open-Meteo data alone.

#### Scenario: Matching provider hours are merged into one forecast row
- **GIVEN** a resolved location with latitude and longitude
- **AND** both Open-Meteo and YR return data for the same hour
- **WHEN** the page combines the provider responses
- **THEN** the resulting forecast row uses YR values for surface conditions
- **AND** retains Open-Meteo fields for pressure-level winds, temperatures, cloud cover, and stability data

#### Scenario: Open-Meteo data still renders when YR is missing for an hour
- **GIVEN** a resolved location and an Open-Meteo hour without a matching YR hour
- **WHEN** the page combines the data sources
- **THEN** the page still produces a forecast row for that hour
- **AND** the row is marked as not using YR source data

### Requirement: The page SHALL evaluate and group forecast hours in the location timezone before rendering them
The system SHALL discard forecast hours older than one hour before the current time so the table includes the previous hour and newer entries only.

The system SHALL evaluate each remaining hour with `isGoodParaglidingCondition()` using `DEFAULT_ALERT_RULE` and the location's allowed wind directions from `locationToWindDirectionSymbols()`.

The system SHALL expose the evaluation outcome as `is_promising`, validation failures, and validation warnings for use in the forecast UI.

The system SHALL group rendered forecast hours by local weekday using the location timezone when present, or `Europe/Oslo` when no location timezone is stored.

The system SHALL omit the final grouped day if that day contains fewer than three forecast hours.

The system SHALL derive day-summary weather icons from YR six-hour symbols and SHALL fall back to YR six-hour data when far-future hourly symbols are unavailable.

#### Scenario: Forecast hours are validated and grouped by local day
- **GIVEN** merged hourly forecast rows for a location with a stored timezone
- **WHEN** the page filters, validates, and groups them
- **THEN** each rendered hour includes promising-state and validation text derived from the default alert rule
- **AND** weekday groupings are based on the location timezone rather than raw UTC dates

#### Scenario: A truncated final day is removed
- **GIVEN** grouped forecast data where the last local weekday contains fewer than three hours
- **WHEN** the forecast groups are finalized for rendering
- **THEN** the system removes that final weekday from the rendered forecast table

### Requirement: The page SHALL render the location as a detail experience with quick actions, expandable content, forecast drill-down, and Windy context
The page SHALL render a header with the location name, altitude, allowed wind-direction compass, and quick-access buttons for favourites, map return, Flightlog, YR, Windy, and Google Maps.

The page SHALL render the location description as stored HTML and SHALL collapse long descriptions until the user expands them.

The page SHALL render the forecast as day-level collapsible sections containing hour rows, and each hour SHALL expand into validation messages plus detailed atmospheric data.

The page SHALL distinguish promising versus non-promising days and hours visually when validation display is enabled.

The page SHALL render an embedded Windy view with switchable models and overlays for the same location coordinates.

The page SHALL include the location contribution section after the forecast and Windy sections, while leaving the contribution mutations themselves to the separate contribution capability.

#### Scenario: User expands a forecast hour for detail
- **GIVEN** the location page has rendered grouped forecast data
- **WHEN** the user opens a day and selects an hour row
- **THEN** the page shows the hour's validation failures and warnings
- **AND** the page shows detailed atmospheric readings, including upper-air wind and temperature layers

#### Scenario: User views a long description
- **GIVEN** the location description exceeds the page's collapsed length threshold
- **WHEN** the page first renders
- **THEN** the description is shown in a collapsed state with a control to reveal the rest
- **AND** the user can collapse it again and return toward the top of the page

### Requirement: The page SHALL provide explicit loading and failure states instead of rendering partial weather content blindly
The system SHALL show a loading spinner while the location record and forecast pipeline are still being resolved.

If any part of the location or forecast loading pipeline throws, the system SHALL show an error state for the page instead of rendering a partially populated forecast view.

If the route completes without a location object, the page SHALL show a location-not-found state rather than rendering header, forecast, or Windy sections with missing data.

#### Scenario: Forecast pipeline fails after location lookup
- **GIVEN** the location record resolves successfully
- **AND** a provider fetch, schema validation, or forecast mapping step throws an error
- **WHEN** the page completes its load attempt
- **THEN** the loading spinner is removed
- **AND** the page shows an error message instead of the normal location detail content