# Flightlog Location Import

## Purpose

This capability lets a user add a paragliding takeoff site to WindLord from the standalone contribute page by entering a Flightlog start ID. The implemented workflow is Norway-scoped: it builds a Flightlog URL with `country_id=160`, scrapes the matching start page through Browserless, extracts and validates location fields, upserts the record by `flightlog_id`, then redirects the user to the imported location page. It exists to bring a missing takeoff into the app without requiring the user to edit database records directly.

## Requirements

### Requirement: Standalone import form validates a Flightlog start ID before syncing

The system SHALL expose a standalone import form on `/contribute` that accepts a Flightlog start ID without requiring authentication.

The system SHALL reject empty input and non-numeric input on the client before calling the synchronize endpoint.

#### Scenario: User submits an empty start ID

- **GIVEN** the user is on the contribute page
- **WHEN** the user submits the import form without entering a Flightlog ID
- **THEN** the form SHALL stay on the page
- **AND** the system SHALL show an error telling the user to enter a Flightlog ID
- **AND** the system SHALL NOT call the synchronize endpoint

#### Scenario: User submits a non-numeric start ID

- **GIVEN** the user is on the contribute page
- **WHEN** the user submits a start ID containing non-digit characters
- **THEN** the form SHALL stay on the page
- **AND** the system SHALL show an error telling the user the Flightlog ID must be numeric
- **AND** the system SHALL NOT call the synchronize endpoint

### Requirement: Synchronization SHALL import from the Norway Flightlog catalog and persist by flightlog ID

The system SHALL call the synchronize route with the submitted Flightlog start ID and the route SHALL validate that the path parameter is present and numeric.

The synchronize route SHALL fetch the Flightlog page for the Norwegian catalog by requesting `fl.html?...country_id=160&start_id=<flightlog_id>` through a Browserless-backed Puppeteer session.

The synchronize route SHALL reject empty, too-short, or otherwise invalid HTML responses, SHALL parse the location name, country, coordinates, altitude, description, and supported wind directions from the returned page, and SHALL validate the extracted location data before persistence.

The synchronize route SHALL enrich the parsed location with a Google Maps timezone when `GOOGLE_MAPS_API_KEY` is configured, and MAY persist an empty timezone when timezone lookup fails.

The persistence layer SHALL upsert the location into `all_paragliding_locations` using `flightlog_id` as the conflict key.

Because the imported payload omits `landing_latitude`, `landing_longitude`, `landing_altitude`, and `is_main`, the upsert SHALL preserve those existing fields when the import updates a location that is already in the database.

#### Scenario: A valid Flightlog page is imported

- **GIVEN** the user submits a numeric Flightlog ID from the contribute page
- **WHEN** the synchronize route can reach Flightlog, parse the returned page, validate the extracted fields, and upsert the location
- **THEN** the route SHALL return the saved location as JSON
- **AND** the saved record SHALL be keyed by `flightlog_id`
- **AND** the saved record SHALL include parsed metadata from Flightlog

#### Scenario: The Flightlog page cannot be parsed into a valid location

- **GIVEN** the synchronize route receives a numeric Flightlog ID
- **WHEN** the HTML response is empty, too short, redirected away from the requested start page, or fails location validation
- **THEN** the route SHALL return an error response instead of persisting a location
- **AND** validation failures SHALL be returned as HTTP 400 responses with the Norwegian validation message

#### Scenario: An existing location is synchronized again

- **GIVEN** a location with the submitted `flightlog_id` already exists in `all_paragliding_locations`
- **WHEN** the synchronize route imports the Flightlog page again
- **THEN** the system SHALL update the location through an upsert on `flightlog_id`
- **AND** any existing landing coordinates and `is_main` value SHALL remain intact

### Requirement: Successful standalone import SHALL keep client browsing state usable

After a successful import from the standalone contribute page, the system SHALL synchronize browser-local map datasets through the shared local-cache capability before navigating away from the form.

If that cache-synchronization step cannot preserve coherent cached map data, the system SHALL clear the affected shared browser-local cache entries instead of leaving stale data in place.

After the cache step completes, the system SHALL navigate the user to `/locations/<flightlog_id>` for the imported start.

If the synchronize request fails, the contribute page SHALL keep the user on the form, stop the loading state, and show an error message from the response when available.

#### Scenario: Import succeeds while browser-local cache synchronization is possible

- **GIVEN** the contribute page has successfully received a saved location from the synchronize route
- **WHEN** the browser already has compatible shared local-cache data
- **THEN** the system SHALL synchronize the imported location into those existing browser-local map datasets
- **AND** the system SHALL navigate to the imported location page

#### Scenario: Import succeeds but browser-local cache synchronization fails

- **GIVEN** the contribute page has successfully received a saved location from the synchronize route
- **WHEN** the follow-up browser-local cache synchronization step throws an error
- **THEN** the system SHALL clear the shared browser-local map cache entries
- **AND** the system SHALL still navigate to the imported location page

#### Scenario: Import request fails

- **GIVEN** the user submitted a numeric Flightlog ID from the contribute page
- **WHEN** the synchronize request returns a non-success response or throws during fetch
- **THEN** the contribute page SHALL remain on `/contribute`
- **AND** the system SHALL show an error message for the failed synchronization
- **AND** the system SHALL stop showing the loading state
