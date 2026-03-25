---
title: Google Maps terrain tap info window and overlay coordination
slug: google-maps-terrain-infowindow-coordination
category: integration-issues
problem_type: integration_issue
components:
  - GoogleMaps
  - useGoogleMaps
  - useMapInstance
  - useInfoWindows
  - useOverlayManagement
tags:
  - google-maps
  - react
  - infowindow
  - advanced-marker
  - overlays
  - react-dom-client
resolved_in_commit: 54c81d081ca8db2bfe947f94b86bf82ad2173dec
commit_subject: "add tiny infowindow + many fixes"
date: "2026-03-25"
related_docs: []
---

## Problem symptom

- Need a **compact “terrain tap” info window** (external links such as Yr and Google Maps) when the user taps the map background, without breaking **double-click zoom**, **filter overlays**, or **marker-anchored info windows**.
- Prior structure scattered **React `createRoot` / unmount** logic, used **generic map click handling inside `useMapInstance`**, and had **tight coupling** between map bootstrap and product behavior (including `closeOverlays` indirection).

## Investigation / what changed (commit archaeology)

**Commit:** `54c81d081ca8db2bfe947f94b86bf82ad2173dec`  
**AuthorDate / CommitDate differ** — typical of amend/rebase or delayed push; functional narrative is in the commit body (terrain coordination, single ref-sync effect, shared opener).

**Scope:** 15 files, ~415 insertions / ~87 deletions (including `tsconfig.tsbuildinfo` refresh).

Key moves identified in history review:

1. **Feature-owned listeners** — `click` / `dblclick` on `mapInstance` live in `useMapClickLinksInteraction`, not in `useMapInstance` (bootstrap stays dumb). Clicks without `event.latLng` return immediately so no delayed handler or overlay close runs without a coordinate.
2. **Ref freshness** — callback props (`overlaysOpen`, `closeOverlays`, `openInfoWindow`, `isInfoWindowOpen`) sync in **one** `useEffect`. `mapInstance` uses `mapInstanceRef.current = mapInstance` each render (not that effect). Click/double-click handlers use refs updated each render so listeners stay stable while reading latest logic.
3. **Shared React-in-InfoWindow lifecycle** — `createInfoWindowReactContent` returns `{ container, dispose }`; `useInfoWindows` disposes previous content when opening/closing.
4. **One coordinated path for marker opens** — `useOpenAnchorInfoWindowWithTerrainCoordination` clears pending terrain tap, optionally closes overlays, opens window, marks marker-open time for the map-click guard.

## Root cause analysis

| Issue | Why it hurt |
|--------|-------------|
| Double-click also opened popup | Single-tap handler fired in the same gesture window as dblclick zoom. |
| Map click after marker tap | Maps can emit a map `click` after a marker interaction on some platforms. |
| Duplicated `createRoot` | Risk of **leaked roots** and inconsistent cleanup when swapping InfoWindow content. |
| `onMapClick` in `useMapInstance` | Mixed **infrastructure** (map init) with **product rules** (overlays, info windows, timing). |
| Overlay vs info window ordering | Terrain popup should collapse filter UI but stay consistent with `closeOverlays` semantics (`keep: 'infowindow'` where applicable). |

## Working solution

### 1. Shared React content helper

```1:15:src/app/components/GoogleMaps/createInfoWindowReactContent.ts
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

/** DOM node + unmount for InfoWindow content rendered with `react-dom/client`. */
export function createInfoWindowReactContent(node: ReactElement) {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(node);
  return {
    container,
    dispose: () => {
      root.unmount();
    },
  };
}
```

Callers pass `dispose` into `openInfoWindow` as `disposeContent` so roots are torn down when content is replaced or closed.

### 2. Terrain tap: delay, guard, and listener ownership

Constants and intent (abbreviated):

```7:37:src/app/components/GoogleMaps/hooks/controls/useMapClickLinksInteraction.ts
/** Wait longer than double-click interval so zoom does not also open the links popup. */
const SINGLE_TAP_DELAY_MS = 260;

/**
 * Ignore a map click shortly after opening a marker info window — Maps can emit a map click
 * in the same gesture sequence as the marker tap on some platforms.
 */
const MARKER_INFO_WINDOW_OPEN_GUARD_MS = 180;
// ...
/**
 * Map background tap: delayed single-tap opens a compact Yr / Google Maps links info window;
 * coordinates with double-tap zoom, filter overlays, and marker-driven info windows (mobile ordering).
 *
 * Owns `click` / `dblclick` listeners on `mapInstance` so the map bootstrap hook stays unaware of this feature.
 * Marker handlers should call `clearPendingTerrainTap` before opening an anchor info window and
 * `markMarkerInfoWindowOpened` after, so terrain vs marker flows do not fight.
 */
```

`useMapInstance` **drops** the generic `onMapClick` path so this hook is the single place for that behavior.

### 3. Marker opens: one coordinated helper

```14:42:src/app/components/GoogleMaps/hooks/openAnchorInfoWindowWithTerrainCoordination.ts
/**
 * Opens an AdvancedMarker-anchored info window with React content, coordinated with the
 * map-background “terrain links” tap delay and marker-open guard (`useMapClickLinksInteraction`).
 */
export function useOpenAnchorInfoWindowWithTerrainCoordination({
  mapInstance,
  clearPendingTerrainTap,
  closeOverlays,
  openInfoWindow,
  markMarkerInfoWindowOpened,
}: UseOpenAnchorInfoWindowWithTerrainCoordinationParams) {
  return useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement,
      content: ReactElement,
      options?: { closeFilterOverlays?: boolean }
    ) => {
      if (!mapInstance) return;
      const closeFilterOverlays = options?.closeFilterOverlays !== false;
      clearPendingTerrainTap();
      if (closeFilterOverlays) {
        closeOverlays();
      }
      const { container, dispose } = createInfoWindowReactContent(content);
      openInfoWindow(mapInstance, marker, container, { disposeContent: dispose });
      markMarkerInfoWindowOpened();
    },
    [mapInstance, clearPendingTerrainTap, closeOverlays, openInfoWindow, markMarkerInfoWindowOpened]
  );
}
```

**Paragliding / special case:** call sites can pass `{ closeFilterOverlays: false }` so filter overlays stay open while still clearing the pending terrain tap and updating the marker-open guard.

### 4. UI and types

- **`MapClickLinksInfoWindow`** in `InfoWindows.tsx` — small link strip; **`ExternalLinkButtons`** gains optional **`iconOnly`** for square compact buttons.
- **`useInfoWindowStyles.ts`** — `.map-click-links-infowindow` overrides global min-width (including a mobile block). Note **`:has(.map-click-links-infowindow)`** — verify target browsers / WebViews.
- **`useOverlayManagement`** — stricter typing for overlay close “keep” keys (`OverlayCloseKeep`); filter controls consume **`CloseOverlaysFn`**.

## What did not work / dead ends (inferred)

- Keeping **map click** inside **`useMapInstance`** while also needing **overlay + info window** coordination increased coupling and made **`closeOverlaysRef`**-style indirection attractive but harder to reason about.
- **Multiple `useEffect` blocks** syncing the same refs to callbacks — replaced by **one** ref-sync effect for clarity and fewer stale-closure bugs.

## Prevention and testing

**Practices**

- Put **Google Maps feature listeners** in **named hooks** that receive `mapInstance`, not in the lowest-level map factory hook.
- Always pair **`createRoot`** for ephemeral UI with an explicit **`unmount`** path when content is swapped (here: `disposeContent`).
- When adding **timeouts**, **document the interaction** they protect (dblclick vs single tap, marker vs map click) in comments next to the constants.

**Suggested manual / automated checks**

- Map **single tap** opens compact links window; **double-click** zooms **without** opening it.
- Open **marker info window**, then **tap map** — no spurious terrain popup inside **guard window**.
- **Filters open** + map tap — overlays dismiss per product rules; terrain popup still behaves.
- **Paragliding** (or any `closeFilterOverlays: false` path) — filters stay, terrain coordination still cleared.

**Risks to monitor**

- **`SINGLE_TAP_DELAY_MS`** / **`MARKER_INFO_WINDOW_OPEN_GUARD_MS`** may need tuning on slow devices or specific touch hardware.
- **`isInfoWindowOpen()`** if implemented via Maps API internals (e.g. `get('map')`) — watch for API behavior changes.
- **Duplicate map bootstrap** — another `useMapInstance` exists under `LocationPage/Contribute/hooks/map/`; this commit touched the **GoogleMaps** stack only; changes may need mirroring if behaviors should align.

## Cross-references

- No existing entries under `docs/solutions/` at documentation time.
- **Git:** `git show 54c81d081ca8db2bfe947f94b86bf82ad2173dec` (local repo).

## Subagent notes (git-history-analyzer)

Structured archaeological summary from `git-history-analyzer` was merged into the “Investigation” and “Risks” sections above (timing guards, listener ownership, `createRoot` centralization, paragliding `closeFilterOverlays: false`).
