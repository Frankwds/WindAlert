# Map Info Window Coordination

## Purpose
This capability coordinates all shared Google Maps info window behavior in the main map experience so terrain taps, marker popups, and filter overlays do not fight each other. It owns the popup lifecycle for the `src/app/components/GoogleMaps` stack, including the compact map-background links popup, marker-anchored popups for paragliding sites, weather stations, and landings, and the ordering rules that keep double-click zoom and overlay dismissal working predictably.

This spec applies to the shared `GoogleMaps` stack used by the home page and the all-locations map. It does not cover the separate map implementation under the location contribution flow.

## Requirements

### Requirement: Shared Info Window Lifecycle
The system SHALL reuse one shared Google Maps `InfoWindow` instance for the active `GoogleMaps` map and SHALL route both coordinate-anchored and marker-anchored popup content through that shared instance.

React-rendered popup content SHALL be mounted into a temporary DOM container and SHALL be explicitly unmounted before the shared popup is reused or closed.

The shared popup SHALL support both `AdvancedMarkerElement` anchors and raw latitude/longitude anchors without shifting this responsibility into the low-level map bootstrap hook.

#### Scenario: Replacing popup content disposes the previous React tree
- **GIVEN** a marker popup is already open on the shared map
- **WHEN** another marker or a terrain tap opens different popup content
- **THEN** the system closes the existing popup, disposes the previous React-mounted content, and opens the new content through the same shared `InfoWindow`

#### Scenario: Closing overlays closes the shared popup unless preserved
- **GIVEN** the shared popup is open
- **WHEN** `closeOverlays()` runs without `keep: 'infowindow'`
- **THEN** the popup closes and any mounted React content is disposed

### Requirement: Terrain Tap Popup Coordination
The system SHALL own map `click` and `dblclick` listeners inside the feature-level terrain tap coordination hook rather than the low-level map bootstrap hook.

When the user taps the map background at a coordinate and no filter overlay is open, the system SHALL delay opening the terrain popup long enough to avoid colliding with double-click zoom. If the interaction remains a single tap, the system SHALL open a compact links popup anchored at the tapped coordinate.

The terrain popup SHALL present quick external links for Yr and Google Maps and SHALL use compact sizing rules rather than the default wide card styling used by other popups.

If filter overlays are open, a map background tap SHALL dismiss the overlays instead of opening the terrain popup. If a second tap or a `dblclick` occurs before the single-tap delay expires, the pending terrain popup SHALL be canceled.

#### Scenario: Single terrain tap opens the compact links popup
- **GIVEN** the user taps the map background and the event has a valid coordinate
- **WHEN** no second tap or `dblclick` interrupts the single-tap delay
- **THEN** the system closes filter overlays with `keep: 'infowindow'` and opens a compact popup with Yr and Google Maps links at that coordinate

#### Scenario: Double-click zoom suppresses the terrain popup
- **GIVEN** the user starts a background tap on the map
- **WHEN** Google Maps produces a `dblclick` during the single-tap delay window
- **THEN** the pending terrain popup is canceled and no terrain popup opens as part of that gesture

#### Scenario: Open overlays consume the background tap
- **GIVEN** the filter control, wind filter, or promising filter is open
- **WHEN** the user taps the map background
- **THEN** the system closes the open overlays and does not open the terrain popup for that tap

### Requirement: Marker Popup Guarding And Ordering
The system SHALL open marker-driven popups through the coordinated marker-popup helper so marker interactions clear any pending terrain tap, reuse the shared popup lifecycle, and record that a marker popup was just opened.

After a marker popup opens, the system SHALL ignore a map background click that arrives inside the marker-open guard window so Google Maps follow-on clicks do not immediately replace the marker popup with the terrain popup.

Weather station and landing markers SHALL use the coordinated helper with default overlay-closing behavior. Paragliding marker interactions SHALL clear overlays before opening the marker popup, clear any previously shown landing marker, and then use the coordinated helper without performing a second overlay close.

#### Scenario: Marker tap does not immediately fall through to a terrain popup
- **GIVEN** the user opens a marker popup
- **WHEN** Google Maps emits a background `click` in the same interaction sequence shortly afterward
- **THEN** the system suppresses the terrain popup and leaves the marker popup coordination intact

#### Scenario: Paragliding marker popup reuses coordination after landing setup
- **GIVEN** the user taps a paragliding marker
- **WHEN** the system prepares the popup flow
- **THEN** it closes overlays, clears any prior landing marker, optionally shows the landing marker for the selected site, and opens the paragliding popup through the shared coordinated helper

### Requirement: Overlay Keep Semantics
The system SHALL provide a typed overlay-closing contract that can dismiss the wind filter, promising filter, filter control, and shared popup selectively.

UI controls that expand one overlay SHALL close the other overlays before opening themselves, while preserving their own overlay via the appropriate `keep` value.

Terrain popup opening SHALL preserve the popup layer during overlay dismissal, while ordinary overlay dismissal SHALL close the shared popup unless explicitly told to keep it.

#### Scenario: Opening one overlay closes competing overlays
- **GIVEN** one map overlay is already open
- **WHEN** the user opens a different overlay control
- **THEN** the system closes the other overlays and keeps only the requested overlay open

#### Scenario: Terrain popup opening preserves the popup layer during overlay dismissal
- **GIVEN** a valid terrain tap has completed its delay window
- **WHEN** the system prepares to open the compact links popup
- **THEN** it dismisses filter overlays with `keep: 'infowindow'` so the popup can open without being closed by the same dismissal step