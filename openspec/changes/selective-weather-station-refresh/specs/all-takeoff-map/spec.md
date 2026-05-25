# Delta for All Takeoff Map

## MODIFIED Requirements

### Requirement: All map SHALL open link-focused marker details and keep weather stations fresh during use
The system SHALL let users inspect takeoff, landing, and weather-station markers from the all map without forcing navigation away from `/locations/all`, and SHALL keep weather-station markers fresh after the initial load.

All-map takeoff popups SHALL reuse the `LocationCardAll` variant, which links to the location page and external weather tools instead of showing the main-map compact forecast summary. When a selected takeoff has landing coordinates, the map SHALL create a landing marker aligned to that takeoff.

Landing popups SHALL show landing metadata and external links, and they SHALL only render landing forecast content when the loaded location data carries forecast rows. Weather-station popups SHALL fetch station history on demand and render loading, error, or data-table states based on the result.

After the delayed initial weather-station load, the all map SHALL refresh weather-station markers on page re-visibility and on a five-minute cadence while the page remains visible, and background refresh failures SHALL leave the current markers visible.

On each refresh, the client SHALL reload latest weather-station data and SHALL compare each station’s latest observation using `station_data.updated_at`. The map SHALL only create, update, or remove individual weather-station markers when a station enters or leaves the live dataset or its latest observation timestamp changes. When no station’s latest observation timestamp changes, the map SHALL NOT recreate weather-station marker instances and SHALL NOT replace the markers array passed to the clusterer.

When a station’s latest observation timestamp changes, the map SHALL update that marker’s wind display on the existing marker instance (without recreating the `AdvancedMarkerElement`) so marker-anchored info windows remain attached.

Weather-station markers SHALL store the current `WeatherStationWithLatestData` on the marker (consistent with paragliding `locationData`) so marker clicks and in-place updates use current station data.

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
- **THEN** the map SHALL reload latest weather-station data
- **AND** the map SHALL update only weather-station markers whose latest observation `updated_at` changed or whose station entered or left the live dataset
- **AND** a refresh failure SHALL leave the current markers visible

#### Scenario: No-change refresh preserves marker instances
- **GIVEN** the all map has already loaded weather-station markers
- **AND** a scheduled or visibility-driven refresh completes
- **WHEN** every station’s latest observation `updated_at` is unchanged from the previous sync
- **THEN** the map SHALL keep the existing weather-station marker instances
- **AND** the map SHALL NOT replace the weather-station markers array in a way that clears and re-adds all clusterer markers

#### Scenario: Open weather-station popup survives a no-change refresh
- **GIVEN** the user has opened a weather-station info window anchored to a marker
- **AND** a scheduled or visibility-driven refresh completes without a change to that station’s latest observation `updated_at`
- **WHEN** the refresh sync finishes
- **THEN** the weather-station info window SHALL remain open and anchored to the same marker

#### Scenario: Changed observation updates only the affected marker
- **GIVEN** the all map has already loaded weather-station markers
- **WHEN** a refresh returns a new latest observation `updated_at` for one station and unchanged timestamps for all others
- **THEN** the map SHALL update the visual and stored location data for that station’s marker only
- **AND** the map SHALL NOT recreate markers for stations whose latest observation `updated_at` is unchanged

#### Scenario: Open popup on a station that receives a new observation
- **GIVEN** the user has opened a weather-station info window for a station
- **AND** a refresh returns a new latest observation `updated_at` for that same station
- **WHEN** the refresh sync finishes
- **THEN** the map SHALL update that station’s marker in place when possible so the info window remains open on the same anchor
- **OR** if the marker must be recreated, the map SHALL re-open the weather-station info window on that station’s marker so the user is not left without a popup
