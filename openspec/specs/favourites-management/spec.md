# Favourites Management

## Purpose
This capability lets a signed-in user mark paragliding locations as personal favourites from a location page and review those saved locations on the dedicated favourites page. It is responsible for the client-side rules around auth gating, favourite persistence through Supabase, and the way favourited locations are rendered with or without forecast data.

Primary entry points are `src/app/components/shared/FavouriteHeart.tsx`, which is mounted from `src/app/components/LocationPage/LocationHeader.tsx`, and `src/app/(pages)/favourites/page.tsx`, which loads and displays the current user's favourited locations.

## Requirements

### Requirement: Favourites SHALL be user-scoped and auth-gated
The system SHALL store favourites per authenticated user and SHALL gate both viewing and mutation of favourites on the current Supabase-authenticated user.

#### Scenario: Signed-out user opens the favourites page
- **GIVEN** the current visitor has no authenticated user in `AuthContext`
- **WHEN** the visitor opens `/favourites`
- **THEN** the page SHALL render the favourites heading
- **AND** the page SHALL instruct the visitor to log in to see their favourite locations
- **AND** the page SHALL NOT request favourites for an unauthenticated user

#### Scenario: Signed-out user presses the favourite toggle
- **GIVEN** a location page is open and no authenticated user is present
- **WHEN** the visitor presses the favourite heart control
- **THEN** the client SHALL show an alert telling the visitor they must log in to add favourites
- **AND** the client SHALL NOT attempt to insert or delete a favourite row

#### Scenario: Authenticated user toggles a favourite
- **GIVEN** an authenticated user is viewing a location page with the favourite heart control
- **WHEN** the control determines the location is not already favourited and the user presses it
- **THEN** the client SHALL insert a row into `favourite_locations` for that user and location
- **AND** the control SHALL switch to the filled-heart state
- **WHEN** the location is already favourited and the user presses the control
- **THEN** the client SHALL delete the matching row from `favourite_locations`
- **AND** the control SHALL switch back to the outline-heart state

### Requirement: Favourites browsing SHALL render all saved locations with optional forecast data
The system SHALL load favourited locations for the authenticated user from `favourite_locations` joined to `all_paragliding_locations`, and it SHALL render each location even when no future `forecast_cache` rows are available.

Operational context:
- `FavouriteLocationService.getAllForUserWithForecast` joins `favourite_locations` to `all_paragliding_locations` and embeds filtered future `forecast_cache` rows.
- The embedded forecast filter uses the same app forecast range as the main map (`src/lib/utils/forecastRange.ts`: `time >= now` and `time < getForecastRangeEnd(now)`).
- The embedded forecast filter narrows the nested forecast array, not the top-level favourite row, so locations without current forecast still remain renderable.
- The page chooses `LocationCard` for `is_main` locations and `LocationCardAll` for non-main locations.

#### Scenario: Authenticated user opens favourites with mixed main and non-main locations
- **GIVEN** the authenticated user has saved favourite locations
- **AND** at least one favourite is marked `is_main = true`
- **AND** at least one favourite is marked `is_main = false`
- **WHEN** the user opens `/favourites`
- **THEN** the page SHALL render one card per favourited location
- **AND** main favourites SHALL use the main location card variant that can show forecast rows
- **AND** non-main favourites SHALL use the alternate card variant with external links and no hourly forecast widget

#### Scenario: Favourite has no future forecast rows
- **GIVEN** an authenticated user has a favourite location whose embedded `forecast_cache` array is empty or missing
- **WHEN** the favourites page renders that location
- **THEN** the location SHALL still be included in the page results
- **AND** any main-location card for that favourite SHALL show the no-forecast message instead of forecast rows

#### Scenario: Authenticated user has no favourites
- **GIVEN** the authenticated user has no favourite locations
- **WHEN** the user opens `/favourites`
- **THEN** the page SHALL render the favourites heading
- **AND** the page SHALL show the empty-state message stating that the user has no favourite places yet

### Requirement: Favourite status checks and errors SHALL remain local to the invoking UI
The system SHALL resolve favourite status in the heart control from the current authenticated user and location, and it SHALL keep toggle or status-check failures local to that control instead of routing through a global error surface.

#### Scenario: Favourite status lookup fails
- **GIVEN** the favourite heart control is mounted for an authenticated user
- **WHEN** the status check against `favourite_locations` fails
- **THEN** the control SHALL log the failure
- **AND** the control SHALL render its inline error state
- **AND** the user SHALL be able to dismiss that inline error state and retry by interacting again

#### Scenario: Toggle request fails
- **GIVEN** the favourite heart control is mounted for an authenticated user
- **WHEN** an add or remove request fails
- **THEN** the control SHALL log the failure
- **AND** the control SHALL render its inline error state instead of changing the persisted favourite state optimistically

#### Scenario: Favourites page fetch fails
- **GIVEN** an authenticated user opens `/favourites`
- **WHEN** the favourites fetch fails
- **THEN** the page SHALL log the failure and stop loading
- **AND** the page SHALL fall through to the same rendered state used for an empty favourites list because the fetch error is not surfaced separately in the page UI