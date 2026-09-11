## ADDED Requirements

### Requirement: Refresh tokens are opaque and hash-stored

The system SHALL issue cryptographically random opaque refresh tokens (never JWT) and persist only their hash in Postgres `refresh_tokens{token_hash,family_id,used_at,revoked_at,replaced_by,ip,user_agent}`.

#### Scenario: Login creates a new family
- **WHEN** a user logs in
- **THEN** a new `family_id` is created, the refresh hash is stored, and no plaintext token exists in the database

### Requirement: Rotation consumes exactly once

The system SHALL rotate a valid refresh token in a single transaction: mark `used_at`, create the successor in the same `family_id`, and set `replaced_by`.

#### Scenario: Valid refresh rotates
- **WHEN** `POST /auth/refresh` receives an unused, unrevoked, unexpired refresh token
- **THEN** the API returns a new access token plus a successor refresh token, and the old token is marked used

### Requirement: Concurrent rotation is atomic

The system SHALL guarantee that two concurrent requests presenting the same refresh token result in exactly one successful rotation (row lock or conditional `UPDATE ... WHERE used_at IS NULL`).

#### Scenario: Double-submit race
- **WHEN** two requests concurrently present the same valid refresh token
- **THEN** one receives 200 with new tokens and the other is rejected

### Requirement: Reuse revokes the whole family

The system SHALL treat presentation of an already-consumed refresh token as reuse: revoke every token of that `family_id`, forcing re-authentication.

#### Scenario: Replay of a consumed token
- **WHEN** `POST /auth/refresh` receives a token with `used_at` already set
- **THEN** the API responds 401 and the successor token from the earlier rotation also stops working

### Requirement: Login and refresh are throttled

The system SHALL throttle login/refresh attempts per (ip, canonical email) over Redis.

#### Scenario: Brute-force burst
- **WHEN** an attacker bursts invalid credentials
- **THEN** further attempts receive 429 until the window resets
