# Proposal: Selective Weather Station Marker Refresh

## Intent

Every five minutes the main and all takeoff maps reload weather-station data and rebuild every `AdvancedMarkerElement`. That tears down the marker clusterer membership and breaks marker-anchored info windows — including an open station popup a user may be reading.

Most scheduled polls do not change any station’s latest reading. The maps should treat `station_data.updated_at` as the change signal and skip work when nothing moved, updating only stations that gained, lost, or changed their latest observation.

## Problem

- `useWeatherStationMarkers` calls `createWeatherStationMarkers` on every refresh and replaces the entire markers array in React state.
- `Clusterer` reacts to that array change with `clearMarkers()` then `addMarkers()` for the full set.
- The shared `InfoWindow` is anchored to a marker instance; when that instance leaves the clusterer, the popup closes or detaches.

## Scope

- Main map (`variant='main'`) and all takeoff map (`variant='all'`) weather-station live refresh paths.
- Initial delayed load, tab re-visibility refresh, and five-minute cadence while the tab is visible.
- Marker registry keyed by `station_id`, diffed by latest observation `updated_at`.
- In-place visual update for markers whose observation changed; add/remove when stations enter or leave the live dataset.
- Small foundation alignment: `locationData` on weather markers (parity with paragliding), shared observation-key helper, unified sync path inside the hook.

## Approach

1. Introduce `stationLatestObservationKey(station_data)` returning `updated_at`.
2. Keep a ref-based registry `Map<station_id, { marker, observationKey, location }>` inside `useWeatherStationMarkers`.
3. On each fetch, diff against the registry; skip `setWeatherStationMarkers` when membership and keys are unchanged.
4. For changed stations, refresh wind visuals on the existing marker content container (SVG + text + `dataset`) and update `locationData` without recreating the `AdvancedMarkerElement`.
5. Call `setWeatherStationMarkers` only when marker instances are added or removed.
6. Re-open the weather-station info window only if a marker had to be recreated while that station’s popup was open (fallback; in-place path keeps the anchor).

## Non-goals

- Polling only `latest_station_data` without station metadata (network optimization).
- Incremental `MarkerClusterer.addMarker` / `removeMarker` per delta (acceptable follow-up; no-op ticks avoid clusterer entirely).
- Forcing cluster bubbles to refresh immediately after in-place wind changes (cluster icons may lag until pan/zoom; see design).
- Refreshing historical rows inside an open weather-station info window when new data arrives.
- Paragliding or landing marker live refresh (they load once today).
- Generic reusable “marker sync framework” shared across marker types.

## Success criteria

- A scheduled refresh where no station’s latest `updated_at` changes performs no marker recreation and does not reset the clusterer.
- An open weather-station info window survives a no-change refresh.
- A station whose latest observation changes updates visually; stations entering or leaving `latest_station_data` are added or removed.
- When the open popup’s station receives a new latest observation, the popup SHALL stay open (preferred via stable marker anchor + in-place update) or SHALL re-open on that marker if the anchor cannot be preserved.
- Stations that lose a `latest_station_data` row on refresh are removed from the map (no objection).
- Scope is main and all takeoff maps only (`useWeatherStationMarkers` / `GoogleMaps`), not contribute or other maps.
- Background refresh failures still leave existing markers visible (unchanged behavior).

## Affected specs

- `openspec/specs/main-takeoff-map/spec.md`
- `openspec/specs/all-takeoff-map/spec.md`
