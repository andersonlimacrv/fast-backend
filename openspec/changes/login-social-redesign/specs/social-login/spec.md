# social-login — delta spec

## ADDED Requirements

### Requirement: Generic OIDC login behind a flag

The system SHALL activate social login only when `SOCIAL_LOGIN_ENABLED=true`,
using one generic OIDC provider configured by `OIDC_*` settings. With the flag
off, no `/auth/social*` route SHALL exist and `/meta` SHALL report
`social.enabled=false` without exposing issuer, client id, secret or redirect
URI.

#### Scenario: Flag off is inert

- **GIVEN** `SOCIAL_LOGIN_ENABLED=false`
- **WHEN** the app starts
- **THEN** `/meta` contains `social.enabled=false`
- **AND** no path starting with `/auth/social` exists in `/openapi.json`

#### Scenario: Flag on advertises only safe metadata

- **GIVEN** `SOCIAL_LOGIN_ENABLED=true` and a valid OIDC configuration
- **WHEN** an anonymous client reads `/meta`
- **THEN** `social` contains `enabled=true`, `provider` and `display_name`
- **AND** the payload contains no issuer, client id, secret or redirect URI

### Requirement: Authorization uses state, nonce and PKCE S256

`GET /auth/social/{provider}/authorize` SHALL mint a single-use `state`, a
PKCE `code_verifier` and a `nonce`, store the verifier server-side with a short
TTL, set an `HttpOnly`, `SameSite=Lax` binding cookie scoped to
`/auth/social`, and redirect to the provider authorization endpoint with
`code_challenge_method=S256`.

#### Scenario: Authorization redirect carries PKCE

- **WHEN** the SPA opens the authorize endpoint
- **THEN** the response is a 302 to the provider with `state`, `nonce`,
  `code_challenge` and `code_challenge_method=S256`
- **AND** the state cookie is `HttpOnly`

#### Scenario: Replayed state is refused

- **GIVEN** a state already consumed by a callback
- **WHEN** the callback is replayed with the same state
- **THEN** the browser is redirected to the frontend with a generic
  `social_error` code and no session is created

### Requirement: Callback exchanges a one-time grant, never tokens in the URL

The callback SHALL exchange the authorization code, resolve the provider
profile, link or create the local user, and redirect to
`FRONTEND_URL/auth/social/callback?code=<grant>` where the grant is opaque,
single-use and expires quickly. `POST /auth/social/exchange` SHALL consume the
grant and return the standard token pair (setting session cookies when cookie
mode is enabled). Tokens SHALL NOT appear in any URL, log or redirect.

#### Scenario: Grant exchange logs the user in

- **GIVEN** a successful provider callback
- **WHEN** the SPA posts the grant to `/auth/social/exchange`
- **THEN** the response is a standard `TokenPair`
- **AND** replaying the same grant returns 400

### Requirement: Account linking is safe

The system SHALL authenticate an existing `(provider, provider_sub)` link
first. It SHALL auto-link by canonical email only when the provider asserts
`email_verified=true`. Without a link and without a verified email it SHALL
refuse with a generic error and create nothing. Inactive accounts SHALL be
refused. Created users SHALL have no password `Credential`.

#### Scenario: Verified email links an existing account

- **GIVEN** a local user with `ada@example.com`
- **WHEN** the provider returns that email with `email_verified=true` and no
  existing link
- **THEN** the identity is linked to the existing user id

#### Scenario: Unverified email creates nothing

- **GIVEN** no link and an unknown email with `email_verified=false`
- **WHEN** the callback completes
- **THEN** the login is refused and no user or identity is created
