# Location Contribution Panel

## Purpose

Document the inline contribution tools shown on a single location page. This capability lets users refine landing data for an existing takeoff, resynchronize that takeoff from Flightlog, and change whether the takeoff is shown in the main map. The panel is mounted by the single-location page and spans both the client-side widgets under `src/app/components/LocationPage/Contribute/` and the directly-invoked contribution routes under `src/app/api/contribute/`.

This spec covers current implemented behavior only. It does not cover the standalone contribute page for adding a new location by Flightlog ID, and it does not cover backend-only ingestion flows that are not triggered from this panel.

## Requirements

### Requirement: Location pages SHALL expose a three-action contribution panel

The single-location page SHALL render an inline contribution section after the location header, forecast table, and Windy widget. The section SHALL include all three of these actions for the current location: landing editing, Flightlog synchronization, and main-map visibility toggling.

The contribution panel SHALL derive its behavior from the currently loaded location record, including the location ID, Flightlog ID, takeoff coordinates, takeoff altitude, existing landing coordinates, landing altitude, and current `is_main` state.

#### Scenario: Loaded location page renders the contribution actions

- **GIVEN** a location page has loaded a valid `ParaglidingLocation`
- **WHEN** the page renders the lower section of the location view
- **THEN** it shows a `Bidra` section
- **AND** the landing editor receives the current takeoff and landing values for that location
- **AND** the sync action receives the current `flightlog_id`
- **AND** the main-toggle action receives the current `locationId` and `is_main` value

### Requirement: Landing edits SHALL require authentication and validate plausible landing placement

The landing editor SHALL stay collapsed until opened by the user. When opened, it SHALL scroll into view and present a dedicated map centered on the takeoff location with a takeoff marker and an editable landing marker when landing coordinates already exist.

If the user is not authenticated, the landing editor SHALL show a login prompt and SHALL reject landing changes and save attempts. If the user is authenticated, clicking the map SHALL place a draggable landing marker and dragging that marker SHALL update the candidate landing coordinates.

While the landing editor is open and the landing altitude has not been manually overridden, the client SHOULD attempt to fetch elevation for the current landing coordinates and prefill the landing altitude. The save action SHALL remain disabled until authenticated coordinates exist and they differ from the initial landing coordinates.

When saving, the client SHALL send an authenticated `POST` request to `/api/contribute/landing`. The server SHALL reject requests with missing fields, invalid coordinates, negative altitudes, and implausible landing distances. If both takeoff and landing altitudes are present, plausibility SHALL be enforced with a glide-ratio rule of `heightDifference * 10`; otherwise the fallback maximum distance SHALL be 10,000 meters.

On success, the server SHALL update the landing fields of the location record, attempt to append a `changelog_landings` entry without failing the main mutation if changelog insertion fails, and return the updated location. The client SHALL synchronize browser-local map datasets through the shared local-cache capability before closing the editor and reporting success.

#### Scenario: Authenticated user moves a landing and saves it

- **GIVEN** an authenticated user opens the landing editor on a location page
- **AND** the user clicks the map or drags the existing landing marker to a new position
- **WHEN** the new landing differs from the initial landing and the user confirms the save
- **THEN** the client sends the new landing coordinates and altitude to `/api/contribute/landing` with a bearer token
- **AND** the server validates the request and updates `landing_latitude`, `landing_longitude`, and optionally `landing_altitude`
- **AND** the server attempts to record previous and new landing values in `changelog_landings`
- **AND** the client synchronizes browser-local map datasets before closing the editor and showing a success message

#### Scenario: Unauthenticated user opens the landing editor

- **GIVEN** a user without a valid session opens the landing editor
- **WHEN** the editor content is rendered
- **THEN** the panel shows a login prompt instead of an editable contribution map
- **AND** landing changes are ignored
- **AND** the save action is not available for submission

#### Scenario: Landing save is rejected as implausible

- **GIVEN** an authenticated user submits landing coordinates that exceed the allowed distance rule
- **WHEN** `/api/contribute/landing` evaluates the request
- **THEN** the route returns a `400` response with a validation error
- **AND** the client keeps the editor open and displays the returned error instead of updating cache or closing the editor

### Requirement: Flightlog synchronization SHALL refresh location metadata while preserving local contribution fields

The contribution panel SHALL provide a Flightlog synchronization action for the current location. This action SHALL call `GET /api/contribute/synchronize/[flightlog_id]` without requiring an authenticated session.

The synchronization route SHALL validate that `flightlog_id` is numeric, fetch the corresponding Flightlog page through Browserless-backed Puppeteer navigation, extract location fields from the returned HTML, validate the extracted location data, and fetch a timezone for the location from the Google Maps Time Zone API.

The synchronization route SHALL upsert the location by `flightlog_id`. That upsert SHALL preserve existing landing fields and `is_main` state by excluding those fields from the upsert payload. On success, the client SHALL synchronize browser-local map datasets through the shared local-cache capability and reload the current page so the refreshed location record is shown.

#### Scenario: User synchronizes an existing location from Flightlog

- **GIVEN** a location page is showing an existing takeoff with a Flightlog ID
- **WHEN** the user presses `Synkroniser med Flightlog`
- **THEN** the client calls `/api/contribute/synchronize/<flightlog_id>` and shows a syncing state
- **AND** the server re-scrapes and validates the Flightlog page for that ID
- **AND** the server upserts the location by `flightlog_id` without overwriting existing landing coordinates or `is_main`
- **AND** the client synchronizes browser-local map datasets and reloads the page after success

#### Scenario: Flightlog synchronization fails validation or scraping

- **GIVEN** the Flightlog fetch or extracted data is invalid
- **WHEN** the synchronize route handles the request
- **THEN** it returns an error response describing the validation or processing failure
- **AND** the client leaves the page in place and displays the sync error instead of reloading

### Requirement: Main-map visibility changes SHALL require authentication and update both persistence and cache membership

The contribution panel SHALL provide an action that toggles whether the location is a main takeoff. If the user is not authenticated, this action SHALL render a login prompt instead of an active toggle button.

If the user is authenticated, activating the toggle SHALL ask for confirmation before submitting. The client SHALL send an authenticated `POST` request to `/api/contribute/is-main` with the location ID and the new boolean value.

The server SHALL validate the request, update the location's `is_main` field, attempt to append a `changelog_is_main` entry without failing the main mutation if changelog insertion fails, and return the updated location. The client SHALL then synchronize browser-local map datasets through the shared local-cache capability so that main-map membership stays coherent, and reload the page after showing a success acknowledgment.

#### Scenario: Authenticated user promotes a location to the main map

- **GIVEN** an authenticated user is viewing a location whose `is_main` value is `false`
- **WHEN** the user confirms the `Sett som hovedstart` action
- **THEN** the client submits the new `is_main` value to `/api/contribute/is-main` with a bearer token
- **AND** the server updates the location record and attempts to log the previous and new `is_main` values in `changelog_is_main`
- **AND** the client synchronizes browser-local map datasets so main-map membership stays coherent
- **AND** the page reloads to reflect the updated status

#### Scenario: Unauthenticated user reaches the main-toggle area

- **GIVEN** a user without a valid session reaches the main-toggle section
- **WHEN** that section renders
- **THEN** it shows a login prompt
- **AND** it does not expose an active toggle request for changing `is_main`
