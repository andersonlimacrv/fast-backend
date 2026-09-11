## ADDED Requirements

### Requirement: New passwords use Argon2id

The system SHALL hash newly created or changed passwords with Argon2id via `pwdlib`.

#### Scenario: Registration hashes with Argon2id
- **WHEN** a user registers or changes their password
- **THEN** the stored hash is verifiable as Argon2id and the plaintext is never persisted or logged

### Requirement: Bcrypt hashes remain verifiable for migration

The system SHALL verify legacy bcrypt hashes (including SHA-256 pre-hashed long passwords) without forcing a password reset.

#### Scenario: Legacy user logs in
- **WHEN** a user with a bcrypt hash logs in with the correct password
- **THEN** authentication succeeds and the hash is transparently re-hashed with Argon2id on success

### Requirement: Hashing cost is configurable

The system SHALL expose Argon2id memory/time/parallelism parameters via settings.

#### Scenario: Operator tunes cost
- **WHEN** the operator sets hashing parameters for the target hardware
- **THEN** new hashes use the configured parameters while verification of old hashes keeps working
