# Design: Selective Weather Station Marker Refresh

## Context

Weather stations on the shared `GoogleMaps` stack are owned by `useWeatherStationMarkers`, created via `MarkerSetup.createWeatherStationMarker`, clustered by `Clusterer`, and opened through `useOpenAnchorInfoWindowWithTerrainCoordination` + `getWeatherStationInfoWindow`.

Data flow today:

```
loadLatestWeatherStationData()
  → WeatherStationService.getAllActive(isMain)
  → StationDataService.getLatestStationData()
  → merge to WeatherStationWithLatestData[]

updateMarkersWithLatestData()
  → createWeatherStationMarkers()   // new AdvancedMarkerElement each time
  → setWeatherStationMarkers(markers)
  → Clusterer effect: clearMarkers + addMarkers
```

Paragliding markers attach `locationData` on the marker for filtering; weather stations close over `location` in the click listener at creation time and do not attach `locationData`.

Full marker recreation on every poll is a **simplicity** choice (one `createWeatherStationMarkers` call), not a platform limitation. In-place updates are feasible when the content **container** is preserved and only its children (SVG + speed text) and `dataset` are refreshed.

## Decision record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Change detection | `station_data.updated_at` only | User confirmed; matches “last observation in timeline” for map markers (single latest row). |
| Registry location | Ref inside `useWeatherStationMarkers` | One consumer; avoids premature shared abstraction. |
| When to `setState` | Only on add/remove of marker instances | Unchanged tick → same array reference → Clusterer effect does not run. |
| Changed station update | Refresh wind DOM on existing content container + `dataset` + `locationData` | Keeps same `AdvancedMarkerElement` and click/hover listeners (assigned at create). Do **not** assign a new root `marker.content` without re-binding listeners. |
| Observation key helper | `src/lib/supabase/stationObservationKey.ts` (or adjacent) | Pure, unit-testable, single source of truth. |
| Click handler data source | Read `locationData` from marker | Parity with paragliding; survives in-place updates. |
| Clusterer incremental API | Defer | No-op path is the main win; partial updates still rare. |
| Metadata + latest poll split | Defer | Separate network optimization. |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ useWeatherStationMarkers                                     │
│                                                              │
│  markersRef: Map<station_id, Entry>                          │
│  weatherStationMarkers: AdvancedMarkerElement[]  (state)     │
│                                                              │
│  syncWeatherStationsFromFetch()                              │
│    1. fetch WeatherStationWithLatestData[]                   │
│    2. for each station:                                      │
│         key = stationLatestObservationKey(station_data)      │
│         if new → createWeatherStationMarker, registry.set      │
│         if key unchanged → skip                              │
│         if key changed → updateWeatherStationMarker(...)     │
│    3. for registry keys not in fetch → remove, registry.del  │
│    4. if any add/remove → setState([...registry values])     │
│       else if only in-place updates → optional no setState   │
└──────────────────────────────────────────────────────────────┘
```

### Observation key

```ts
export function stationLatestObservationKey(data: StationData): string {
  return data.updated_at;
}
```

Stations without a row in `latest_station_data` are excluded at fetch time (existing behavior).

### Marker entry

```ts
type WeatherStationMarkerEntry = {
  marker: google.maps.marker.AdvancedMarkerElement;
  observationKey: string;
  location: WeatherStationWithLatestData;
};
```

### Unified sync

Replace separate `loadMarkers` and `updateMarkersWithLatestData` bodies with one `syncWeatherStationsFromFetch({ showLoading?: boolean })`:

- Initial load: `showLoading: true`, same 2s delay as today.
- Interval / visibility: `showLoading: false`, preserve “failure leaves markers visible” for background refresh.

### Create vs update (`MarkerSetup.tsx`)

**createWeatherStationMarker** (existing path):

- Attach `(marker as any).locationData = location` (new).
- Click listener calls `onMarkerClick(marker, marker.locationData)` or reads from marker in parent.

**refreshWeatherStationWindMarkerContent** (new, in `Markers.tsx`):

- Take the existing content `container` (the same node `createWeatherStationMarker` attached listeners to).
- Replace **children only** (wind SVG + speed text) using existing DOM helpers; update `container.dataset.windSpeed` / `windDirection`.
- Preserves `mouseenter` / `mouseleave` / `click` listeners without re-attach.

**updateWeatherStationMarker** (new, in `MarkerSetup.tsx`):

- `container = marker.content as HTMLElement`
- Call `refreshWeatherStationWindMarkerContent(container, location.station_data)`
- Set `locationData` and `marker.title`

**Avoid:** `marker.content = createWeatherStationWindMarkerElement(...)` — that drops listeners and breaks the naive in-place path.

### Click handler (`useGoogleMaps.ts`)

```ts
const onWeatherStationMarkerClick = useCallback((marker, _location?) => {
  const location = (marker as MapMarkerWithLocationData).locationData;
  openAnchorInfoWindow(marker, getWeatherStationInfoWindow(location));
}, [...]);
```

Optional: introduce a narrow type alias for `locationData` on map markers; not required for this change.

### Info window behavior

- **Unchanged station, open popup:** Marker instance stable → InfoWindow anchor stable → popup stays open. Historical table is unchanged (loaded once on open).
- **Changed station, open popup on that station:** Primary path is in-place `updateWeatherStationMarker` so the same `AdvancedMarkerElement` stays anchored → popup stays open. Update `locationData` on the marker; optionally re-mount info window content from fresh `location` if the React tree should reflect new latest wind in the header (historical table may still be stale until re-fetch — acceptable unless we add a targeted refetch later). If anchor is lost (e.g. forced recreate), **re-open** the weather-station info window on the new marker for that `station_id` so the user is not left with a closed popup after a live update.
- **Changed station, open popup on another station:** Unaffected.

### Re-open fallback (`useGoogleMaps` + sync)

Not required when in-place update runs (same `AdvancedMarkerElement` anchor). Needed only if a marker is **recreated** while that station’s popup was open (e.g. add/remove path).

Wiring (~30–40 lines, no new subsystem):

- `openWeatherStationIdRef` set in `onWeatherStationMarkerClick`, cleared on `closeInfoWindow` and `InfoWindow` `closeclick`
- Pass into `useWeatherStationMarkers`: `getOpenWeatherStationId`, `isInfoWindowOpen`, `reopenWeatherStation(marker, location)` → calls `openAnchorInfoWindow(marker, getWeatherStationInfoWindow(location))`
- After sync, if `isInfoWindowOpen()` and open id matches a **recreated** station → `reopenWeatherStation`

### Clusterer interaction

`Clusterer` depends on `[map, markers, renderer, algorithmOptions]`. If `markers` reference is unchanged and no add/remove occurred, the effect does not run — no `clearMarkers`.

When stations are added or removed, `setWeatherStationMarkers` produces a new array; clusterer still does full clear+add (acceptable).

**Known limitation:** `WeatherStationClusterRenderer` reads per-marker `dataset` when a cluster is rendered. In-place `dataset` updates on individual markers do not force an immediate cluster re-draw; **cluster bubbles may show stale dominant wind until pan/zoom/move** (full rebuild used to force re-cluster). Acceptable for v1; optional follow-up: expose `clusterer.render()` after observation changes.

## Files to touch

| File | Change |
|------|--------|
| `src/lib/supabase/stationObservationKey.ts` | New helper + test |
| `src/app/components/shared/Markers.tsx` | `refreshWeatherStationWindMarkerContent(container, station_data)` |
| `src/app/components/GoogleMaps/MarkerSetup.tsx` | `locationData`, `updateWeatherStationMarker` |
| `src/app/components/GoogleMaps/hooks/markers/useWeatherStationMarkers.ts` | Registry, diff, unified sync, re-open hook |
| `src/app/components/GoogleMaps/hooks/useGoogleMaps.ts` | `locationData` click, open-station ref, `closeclick`, re-open callback |
| `src/app/components/GoogleMaps/hooks/controls/useInfoWindows.ts` | Optional: register `closeclick` helper, or listen in `useGoogleMaps` on `infoWindowRef` |
| `src/lib/supabase/stationObservationKey.test.ts` or `__tests__` | Key helper test |

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Stale closure in click handler | Read `locationData` from marker at click time. |
| Memory leak if registry not cleaned on unmount | Clear registry in hook cleanup; remove markers from map if needed. |
| `onWeatherStationMarkerClick` identity changes re-creating markers | Store handler in ref for listener attachment, or re-bind only on create (document in tasks). |
| Effect re-runs if `setState` with new array but same marker refs | Build array from registry values in stable order (e.g. sort by `station_id`). |
| Replacing whole `marker.content` | Use container child refresh only; never swap root content without re-binding listeners. |
| Stale cluster bubble after in-place wind change | Document as known limitation; unclustered markers update immediately. |

## Testing plan

1. **Unit:** `stationLatestObservationKey` returns `updated_at`.
2. **Manual — no change:** Open station popup; wait for 5‑min tick (or trigger refresh with mocked same timestamps); popup stays open, no cluster flicker.
3. **Manual — one station changes:** Only that marker’s wind arrow updates; others unchanged.
4. **Manual — failure:** Simulate fetch error on interval; existing markers remain.

## Resolved product decisions

| Topic | Decision |
|-------|----------|
| Popup on same-station observation change | Stay open via stable anchor + in-place update; if anchor lost, re-open on that station’s marker |
| Station drops out of live dataset | Remove marker |
| Map scope | Main + all only |

## Open questions

None blocking. Optional follow-ups: `clusterer.render()` after observation changes; clusterer incremental add/remove; poll latest data without full metadata refetch; refetch historical rows inside open popup when observation changes.
