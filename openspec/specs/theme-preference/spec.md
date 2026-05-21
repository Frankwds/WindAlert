# Theme Preference

## Purpose
This capability controls the application's light and dark presentation mode for the client-rendered UI. It owns how the selected theme is stored in the browser, how the active theme is exposed to React components, and how the selection is applied to shared CSS variables and theme-specific assets such as navigation branding, Google Maps info windows, and the map "my location" control.

The implementation is entirely client-side. The root layout always renders the app inside `ThemeProvider`, and the provider updates `document.documentElement` after hydration. There is no server-side theme negotiation, cookie-based theme state, or per-page theme override in the current implementation.

## Requirements

### Requirement: Theme state SHALL be client-owned and persisted in browser storage
The system SHALL manage theme state in a client-side React context and persist the selected value in browser `localStorage` using the `windlord_theme` key.

The system SHALL only accept `light` and `dark` as stored theme values. If `localStorage` is unavailable, unreadable, or contains another value, the system SHALL fall back to the default `light` theme.

Because the current `getTheme()` implementation always returns a concrete theme value, the provider SHALL initialize to `light` when no valid stored value exists. The commented system-preference fallback is not active in the implemented behavior.

#### Scenario: Saved theme is restored on startup
- **GIVEN** the browser has `windlord_theme` set to `dark`
- **WHEN** the application hydrates and `ThemeProvider` reads the stored value
- **THEN** the provider uses `dark` as the active theme
- **AND** later writes continue to use the same `windlord_theme` storage key

#### Scenario: Invalid or missing storage falls back to light
- **GIVEN** the browser has no `windlord_theme` entry, or the stored value is not `light` or `dark`
- **WHEN** the application hydrates
- **THEN** the provider resolves the active theme to `light`
- **AND** the system does not derive the initial theme from `prefers-color-scheme` in the current implementation

### Requirement: Theme changes SHALL be applied through the document theme attribute and shared design tokens
The system SHALL apply the active theme by setting the `data-theme` attribute on `document.documentElement`.

The global stylesheet SHALL treat the base `:root` token set as the light theme and SHALL override shared tokens such as background, foreground, border, muted text, navigation colors, and shadow values when `data-theme='dark'` is present.

The application shell SHALL consume these shared tokens so that theme changes affect the overall page background, text color, navigation surface, and shared scrollbar styling without requiring each page to implement its own theme logic.

#### Scenario: Toggling the theme updates shared colors
- **GIVEN** the application is rendered inside `ThemeProvider`
- **WHEN** the active theme changes from `light` to `dark` or from `dark` to `light`
- **THEN** `document.documentElement` receives the matching `data-theme` attribute
- **AND** components styled from the shared CSS variables render with the corresponding token values

### Requirement: Theme-aware UI controls SHALL expose and react to the active theme consistently
The navigation bar SHALL expose a theme toggle button that flips the active theme between `light` and `dark` and updates its accessible label to describe the destination mode.

Theme-aware assets SHALL switch with the active theme where explicitly implemented. In the current frontend, this includes the navigation logo variant, the non-following "my location" map control icon, and the Google Maps info window stylesheet bridge that reapplies custom styles after `data-theme` changes.

The Google Maps info window styling hook SHALL observe the root `data-theme` attribute and SHALL recreate its injected style element when the theme changes so that InfoWindow chrome continues to reflect the active design tokens.

#### Scenario: Navigation toggle switches themed assets
- **GIVEN** the navigation is visible and the active theme is `light`
- **WHEN** the user activates the theme toggle
- **THEN** the active theme becomes `dark`
- **AND** the toggle's aria-label changes to advertise switching back to `light`
- **AND** the navigation logo switches to the dark-theme image asset

#### Scenario: Map UI follows the active theme
- **GIVEN** a Google Maps view is mounted and theme-sensitive map controls are active
- **WHEN** the active theme changes
- **THEN** custom InfoWindow styling is reapplied using the current CSS variables
- **AND** the "my location" control uses the dark or light icon variant when it is not in the special following state