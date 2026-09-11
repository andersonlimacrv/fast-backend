# jwt-access Specification

## Purpose
TBD - created by archiving change auth-foundation. Update Purpose after archive.
## Requirements
### Requirement: Access tokens are short-lived HS256 JWTs

The system SHALL issue access tokens as HS256 JWTs with TTL 10–15 minutes and claims `sub/type/iat/exp/iss/aud/jti/active_org_id`.

#### Scenario: Login returns a compliant access token
- **WHEN** credentials are valid at `POST /auth/login`
- **THEN** the response contains an access token whose decoded claims include `type="access"`, the configured `iss`/`aud`, and expiry within 10–15 minutes

### Requirement: Access tokens are strictly validated

The system SHALL reject tokens with bad signature, wrong `iss`/`aud`, expired `exp`, or `type` other than `access`.

#### Scenario: Forged or expired token
- **WHEN** a request presents a tampered, expired, or non-access token
- **THEN** the API responds 401 without touching domain logic

### Requirement: CurrentPrincipal enforces global revocation

The system SHALL resolve `CurrentPrincipal` by loading the user and requiring `token.iat >= user.tokens_valid_after`; no route performs this check individually.

#### Scenario: Global logout invalidates old tokens
- **WHEN** `invalidate_tokens` sets `tokens_valid_after = now()` and a request arrives with an older access token
- **THEN** the request is rejected with 401 even though the JWT signature is valid

### Requirement: Access token carries organization context

The system SHALL include `active_org_id` in the access token as context, and SHALL issue a new access token with the requested `active_org_id` only when the user holds membership in that organization.

#### Scenario: Switch organization mints a new token
- **WHEN** an authenticated member calls `POST /auth/switch-organization` for one of their organizations
- **THEN** a new access token is issued with the requested `active_org_id`

#### Scenario: Switch without membership
- **WHEN** an authenticated user requests an organization they do not belong to
- **THEN** the API responds 403 and no token is issued

