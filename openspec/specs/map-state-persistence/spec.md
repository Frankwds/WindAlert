# Map State Persistence

## Purpose
This capability preserves the front-end map browsing context across sessions and page transitions. It owns the shared client-side state used by the main takeoff map, the all-takeoff map, fullscreen mode, and the location-page return-to-map action, so a developer changing map controls or navigation can tell which settings are expected to survive reloads and which are intentionally transient.

The capability is implemented as a single validated localStorage record that is read during map and fullscreen initialization and updated when users pan, zoom, change map layers, change filter selections, toggle fullscreen, or choose to jump back to a map from a location page.

## Requirements

### Requirement: Persisted map state SHALL use one shared validated record
The system SHALL persist map browsing state in one shared client-side record that includes map center, zoom, map type, visible marker and overlay toggles, wind filter state, the main-map promising filter state, fullscreen state, and a timestamp.

The system SHALL validate the stored record before using it.

The system SHALL remove invalid persisted data and fall back to default map state when parsing or validation fails.

#### Scenario: Missing persisted state falls back to defaults
- **GIVEN** the browser has no saved map state
- **WHEN** a map page or fullscreen hook reads persisted state
- **THEN** the system uses the default center, zoom, map type, marker visibility, layer visibility, empty wind-direction selection, no promising filter, fullscreen disabled, and a fresh timestamp

#### Scenario: Invalid persisted state is discarded
- **GIVEN** the browser contains a malformed or schema-incompatible saved map state
- **WHEN** the system reads the persisted record
- **THEN** it removes the invalid stored value
- **AND** it continues with default map state instead of reusing partial invalid data

### Requirement: Map pages SHALL restore and update persisted browsing context
The system SHALL initialize the main map and all-takeoff map from the persisted center, zoom, map type, and persisted filter and layer values.

The system SHALL write updated center and zoom after user pan and zoom interactions.

The system SHALL write updated marker visibility, landing visibility, wind filter selection, wind filter logic, skyways visibility, and thermals visibility when those map controls change.

The system SHALL treat filter panel expansion state, wind compass expansion state, and promising-filter drawer expansion state as transient UI state rather than persisted state.

#### Scenario: User map navigation is restored on the next visit
- **GIVEN** a user pans the map, zooms in, and changes map controls on a map page
- **WHEN** the page saves the updated state and the user later reopens a map page
- **THEN** the map initializes from the last persisted center and zoom
- **AND** the persisted map type and persisted visibility and filter selections are reused

#### Scenario: Overlay open state is not restored
- **GIVEN** a user leaves a map page while a filter control or overlay drawer is expanded
- **WHEN** the user returns to a map page
- **THEN** the persisted filter values may be restored
- **BUT** the transient expanded or open UI state starts closed

### Requirement: Expiring wind-oriented filters SHALL be sanitized on load
The system SHALL treat wind-direction selections and the promising filter as time-sensitive state.

If the persisted timestamp is older than 30 minutes, the system SHALL clear selected wind directions and clear the promising filter before continuing, while preserving the rest of the persisted map state.

If the persisted promising filter selects a day or hour range that is outside the currently allowed selection window, the system SHALL clear only the promising filter before continuing.

#### Scenario: Stale wind filters are cleared without resetting the map
- **GIVEN** persisted map state older than 30 minutes contains center, zoom, map type, wind-direction selections, and a promising filter
- **WHEN** a map page initializes from that saved state
- **THEN** the system keeps the saved center, zoom, map type, and other non-expiring settings
- **AND** it clears the saved wind-direction selections
- **AND** it clears the saved promising filter

#### Scenario: Out-of-range promising filter is cleared selectively
- **GIVEN** persisted map state is otherwise valid
- **AND** the saved promising filter no longer fits the allowed day or time bounds at load time
- **WHEN** the map state hook initializes
- **THEN** the system clears the promising filter
- **AND** it preserves the remaining persisted map state

### Requirement: Variant-specific persistence SHALL follow the implemented shared-key behavior
The system SHALL use the same persisted map-state record for both the main takeoff map and the all-takeoff map.

The main takeoff map SHALL restore and persist the promising filter.

The all-takeoff map SHALL not restore a promising filter into its UI and SHALL persist a null promising-filter value for that variant.

#### Scenario: Visiting the all-takeoff map clears shared promising-filter state
- **GIVEN** a user previously saved a promising filter while using the main takeoff map
- **WHEN** the all-takeoff map initializes and persists its filter state
- **THEN** the shared persisted record keeps the common map and layer settings
- **AND** the promising-filter field is stored as null for the all-takeoff variant

### Requirement: Fullscreen and return-to-map flows SHALL participate in persisted map state
The system SHALL store fullscreen state in the same persisted map-state record used by the map pages.

When fullscreen state changes, the system SHALL update persisted fullscreen state and apply the corresponding fullscreen body class for the active page.

When a user chooses the location-page return-to-map action, the system SHALL persist the destination map center from that location and use zoom level 12 before navigating back to the appropriate map variant.

#### Scenario: Fullscreen preference survives revisiting a map page
- **GIVEN** a user enables fullscreen on a map page
- **WHEN** the fullscreen hook persists the change and the user later returns to a map page
- **THEN** the fullscreen hook restores the saved fullscreen value
- **AND** the page applies the fullscreen body class for the restored state

#### Scenario: Returning from a location page recenters the destination map
- **GIVEN** a user is viewing a location page with known coordinates and main-map membership
- **WHEN** the user clicks the return-to-map action
- **THEN** the system stores that location's coordinates as the persisted map center
- **AND** it stores zoom level 12
- **AND** it navigates to the main map for main locations or the all-takeoff map for non-main locations