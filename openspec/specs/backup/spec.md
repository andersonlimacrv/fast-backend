# backup Specification

## Purpose
TBD - created by archiving change audit-observability-backup. Update Purpose after archive.
## Requirements
### Requirement: Encrypted, retained backups

The system SHALL produce `pg_dump(custom) → gzip → openssl enc` artifacts named with UTC timestamp, prune beyond retention, and refuse to run without a passphrase.

#### Scenario: Backup run
- **WHEN** the script runs against a seeded database
- **THEN** one encrypted artifact appears and older ones beyond retention are pruned

### Requirement: Restore drill reproduces data

The system SHALL restore a dropped database from the artifact bit-for-bit at row level.

#### Scenario: Drop and restore
- **WHEN** seed → backup → drop schema → restore runs
- **THEN** previously created users, orgs and projects read back identically (slow test)

