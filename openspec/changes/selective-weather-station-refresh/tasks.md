# Tasks: Selective Weather Station Marker Refresh

## 1. Observation key foundation

- [ ] 1.1 Add `stationLatestObservationKey(station_data: StationData): string` in `src/lib/supabase/stationObservationKey.ts` (returns `updated_at`)
- [ ] 1.2 Add unit test for `stationLatestObservationKey`

## 2. Marker create/update parity

- [ ] 2.1 Attach `locationData: WeatherStationWithLatestData` on weather markers in `createWeatherStationMarker`
- [ ] 2.2 Add `refreshWeatherStationWindMarkerContent(container, station_data)` in `Markers.tsx` (replace container children + `dataset`; do not swap root `marker.content`)
- [ ] 2.3 Add `updateWeatherStationMarker(marker, location)` in `MarkerSetup.tsx` (calls 2.2, updates `locationData` + `title`)
- [ ] 2.4 Update `onWeatherStationMarkerClick` in `useGoogleMaps.ts` to read location from `marker.locationData`

## 3. Registry and diff sync

- [ ] 3.0 Track open weather-station `station_id` (`openWeatherStationIdRef`); clear on `closeInfoWindow` + InfoWindow `closeclick`; pass `getOpenWeatherStationId`, `isInfoWindowOpen`, `reopenWeatherStation` into marker hook
- [ ] 3.1 Add ref-based registry `Map<station_id, WeatherStationMarkerEntry>` in `useWeatherStationMarkers`
- [ ] 3.2 Implement `syncWeatherStationsFromFetch({ showLoading })` with diff logic:
  - new station → create marker, add to registry
  - same `updated_at` → skip
  - changed `updated_at` → `updateWeatherStationMarker`
  - missing from fetch → remove from registry
  - `setWeatherStationMarkers` only when marker instances added or removed
  - recreated station while its popup was open → `reopenWeatherStation`
- [ ] 3.3 Replace `loadMarkers` and `updateMarkersWithLatestData` with calls to unified sync
- [ ] 3.4 Preserve existing timing: 2s initial delay, visibility refresh, 5-minute cadence, `isLoadingRef` guard, background failure behavior
- [ ] 3.5 Clean up registry on hook unmount

## 4. Handler stability (if needed)

- [ ] 4.1 Ensure click handler reference changes do not force full marker recreation (ref for handler or stable listener attachment)

## 5. Verification

- [ ] 5.1 Run unit tests (`npm test` for observation key)
- [ ] 5.2 Manual: open station info window on main map → wait through no-change refresh → popup stays open
- [ ] 5.3 Manual: repeat on all map (`/locations/all`)
- [ ] 5.4 Manual: simulate or wait for one station `updated_at` change → only that marker updates
- [ ] 5.5 Manual: open popup on station X → refresh with new `updated_at` for X → popup stays open or re-opens on X
- [ ] 5.6 Manual: background refresh failure leaves markers visible

## 6. Archive prep

- [ ] 6.1 Run `/opsx:archive` (or merge deltas) to apply spec changes to `openspec/specs/main-takeoff-map/spec.md` and `openspec/specs/all-takeoff-map/spec.md`
