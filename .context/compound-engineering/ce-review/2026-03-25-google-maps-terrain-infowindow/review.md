# ce:review run — Google Maps terrain infowindow feature

**Scope:** `merge-base(HEAD, origin/main)` → working tree — 18 files, ~627 insertions / ~92 deletions  
**Base:** `14e508304807900b6e5217259741128574c107cf`  
**Commits (vs origin/main):** `54c81d0` (feature) → `f334f3e` (docs) → `44e7b25` (maintainability follow-up)  
**Mode:** interactive  

**Untracked (excluded from diff scope):** `compound-engineering.local.md` — add and rerun if it should be reviewed.

**Review team:** correctness, testing, maintainability, agent-native-reviewer, learnings-researcher  
**Conditionals not invoked:** security, performance, api-contract, data-migrations, schema-drift-detector, deployment-verification-agent (diff is client Google Maps / docs / git hygiene only).

## Intent

Add a compact terrain-tap info window (Yr / Google Maps links), coordinate delayed single-tap vs double-click zoom and marker-driven info windows, centralize React `createRoot` lifecycle for InfoWindow content, decouple map bootstrap from product click behavior, document in `docs/solutions/`, and apply maintainability cleanups (comments, constants, `tsconfig.tsbuildinfo` untrack).

## Merged findings (confidence ≥ 0.60)

| Sev | File:line | Title | Reviewers | Conf | Route |
|-----|-----------|-------|-----------|------|-------|
| P2 | `src/app/components/GoogleMaps/hooks/controls/useMapClickLinksInteraction.ts:38` | No automated tests for terrain/marker/overlay interaction | testing | 0.88 | `manual` → `downstream-resolver` |
| P3 | `.cursor/settings.json:1` | Empty workspace settings file added — likely accidental for product PR | maintainability | 0.72 | `safe_auto` → `review-fixer` (delete file or revert) OR `advisory` → `human` if intentional |

## Suppressed

- Speculative clock-skew edge case on marker guard (`msSinceMarkerOpen < GUARD`): confidence &lt; 0.60.

## Residual risks (union)

- Google Maps `InfoWindow#get('map')` stability; timing constants device-dependent; `:has()` in injected CSS for older WebViews.

## Testing gaps (union)

- No Jest/Playwright coverage for: single vs double tap, marker then map tap, filters open + map tap, rapid successive info window opens (dispose), paragliding `closeFilterOverlays: false` path.

## Learnings

- [Known Pattern] `docs/solutions/integration-issues/google-maps-terrain-infowindow-coordination.md` — describes architecture, timings, and coordination contract.

## Agent-native

- No new HTTP API or script surface; map behavior remains human-UI only. Omit dedicated agent tools unless product goals include agent-driven map actions.

## Verdict

**Ready with notes** — No P0/P1 correctness defects identified in synthesis. Ship after manual map QA on target devices; schedule automated interaction tests as downstream work. Optionally drop `.cursor/settings.json` from the PR if `{}` was not intentional.
