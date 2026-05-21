# Google Auth Session

## Purpose
This capability provides the app-wide Google sign-in, sign-out, and session state lifecycle used by WindLord's client-side features. It owns how the application initializes Supabase auth state, starts the Google OAuth flow, exchanges the callback code for a session, restores the user to their pre-login page, and exposes the resulting `user`, `session`, and `loading` state to client components.

This spec does not define the business rules of favourites or contribution features themselves. It defines the shared authentication contract those features depend on. In the current implementation, authentication is primarily a client-side capability with a server callback for code exchange; there is no global middleware-based route protection layer.

## Requirements

### Requirement: App-wide auth context SHALL expose current session state
The system SHALL wrap the application in a single auth provider that initializes the current Supabase session on the client, subscribes to auth state changes, and exposes `user`, `session`, `loading`, `signInWithGoogle`, and `signOut` through a shared hook.

The auth hook SHALL fail fast when used outside the provider so dependent components do not silently run without auth state.

#### Scenario: Root layout provides auth state to all pages
- **GIVEN** the application renders through the root layout
- **WHEN** a page or component calls the shared auth hook
- **THEN** the hook receives auth state from the app-wide provider rather than creating an isolated auth instance

#### Scenario: Initial session is loaded before auth-dependent UI settles
- **GIVEN** the application has mounted in the browser
- **WHEN** the auth provider requests the current Supabase session
- **THEN** it SHALL keep `loading` true until the request completes
- **AND** it SHALL publish the resolved `session` and `user` values to consumers

#### Scenario: Components outside the provider fail explicitly
- **GIVEN** a component calls the shared auth hook without an enclosing auth provider
- **WHEN** the hook evaluates its context
- **THEN** it SHALL throw an error instead of returning undefined auth state

### Requirement: Google sign-in SHALL preserve the user’s current location through OAuth
The system SHALL start Google OAuth from the shared auth provider and SHALL persist the current browser path in session storage before redirecting to the provider.

After the provider redirects back, the system SHALL exchange the authorization code for a Supabase session in the callback route and SHALL continue the browser to a dedicated redirect page that restores the saved path. If no saved path exists, the redirect page SHALL send the user to the home page.

#### Scenario: Sign-in stores the current location before redirecting away
- **GIVEN** an unauthenticated user is browsing any page in the app
- **WHEN** they start Google sign-in through the shared login control
- **THEN** the system SHALL store `pathname + search + hash` in session storage under the current redirect key
- **AND** it SHALL request Google OAuth with a callback URL under `/auth/callback`

#### Scenario: Callback exchange restores the pre-login page
- **GIVEN** Google redirects the browser back with an authorization code
- **WHEN** the callback route successfully exchanges that code for a session
- **THEN** the system SHALL redirect the browser to `/auth/redirect`
- **AND** the redirect page SHALL read the saved path, remove it from session storage, and replace the current location with that saved path

#### Scenario: Missing saved path falls back to the home page
- **GIVEN** the redirect page loads after authentication
- **WHEN** no saved redirect path is present in session storage
- **THEN** the system SHALL replace the browser location with `/`

#### Scenario: Callback exchange failure returns the user to the app shell
- **GIVEN** the callback route receives an authorization code that cannot be exchanged for a session
- **WHEN** the exchange fails or throws
- **THEN** the route SHALL redirect to `/?error=auth_error`
- **AND** this capability SHALL not claim any additional on-page error presentation because no dedicated frontend handler is currently implemented

### Requirement: Auth state changes SHALL drive shared login UI and feature gating
The system SHALL render login UI from shared auth state and SHALL let downstream features gate their own behavior from the same `user` and `loading` signals.

The capability SHOULD present a loading placeholder while auth state is unresolved, SHALL show a Google sign-in action when no user is present, and SHALL show the current user identity plus a sign-out action when a user is present.

This capability SHALL NOT imply global page protection. In the current implementation, dependent features decide locally whether to show content, show a login prompt, or block a mutation request.

#### Scenario: Login control reflects loading, signed-out, and signed-in states
- **GIVEN** the shared login control is rendered in the navigation menu or a contribution prompt
- **WHEN** auth state changes between loading, unauthenticated, and authenticated states
- **THEN** the control SHALL render a matching loading skeleton, Google sign-in action, or signed-in user row with sign-out action

#### Scenario: Feature pages can gate behavior from shared auth state
- **GIVEN** a feature such as favourites or location contribution reads auth state from the shared hook
- **WHEN** no authenticated user is available after loading completes
- **THEN** that feature MAY show a login prompt or unauthenticated message instead of executing user-specific behavior
- **AND** the auth capability SHALL remain the shared source of truth for that decision

#### Scenario: Sign-out updates dependent UI through auth subscription
- **GIVEN** an authenticated user activates sign-out from the shared login control
- **WHEN** Supabase signs the user out and emits an auth state change
- **THEN** the auth provider SHALL update its published `user` and `session`
- **AND** dependent UI SHALL be able to react without a full page reload

### Requirement: Session-backed mutations SHALL hand off bearer tokens explicitly
The system SHALL allow auth-dependent mutation flows to retrieve the current Supabase access token from the client session and send it as a bearer token to route handlers that validate the caller.

This handoff is part of the shared auth contract because the contribution UI depends on the authenticated client session, but the route handlers perform their own token verification rather than trusting client UI state alone.

#### Scenario: Contribution actions attach the current access token
- **GIVEN** an authenticated user submits a contribution action that requires authorization
- **WHEN** the client prepares the request
- **THEN** it SHALL request the current Supabase session from the client
- **AND** it SHALL send the access token in the `Authorization: Bearer ...` header

#### Scenario: Missing access token blocks authenticated mutation from the client
- **GIVEN** a contribution flow requires an authenticated request
- **WHEN** the client cannot obtain an access token from the current session
- **THEN** it SHALL stop before sending the mutation
- **AND** it SHALL show an error telling the user to log in and try again