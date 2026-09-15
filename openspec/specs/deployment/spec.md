# deployment Specification

## Purpose
TBD - created by archiving change release-template. Update Purpose after archive.
## Requirements
### Requirement: Immutable images and gated deploy

The system SHALL publish images tagged only by git SHA; deploy runs migrate, then starts app+worker, then requires `/readyz` 200 within retries, else rolls back to the previous SHA automatically.

#### Scenario: Failed healthcheck rolls back
- **WHEN** the new revision never becomes ready
- **THEN** the previous SHA is brought back up and the run fails loudly

#### Scenario: Rollback decision logic
- **WHEN** `scripts/deploy.py` helpers evaluate healthy/unhealthy outcomes
- **THEN** unit tests pin tag resolution, gate, and rollback selection

### Requirement: Local and prod compose parity

The system SHALL boot the full stack from compose files with one command per environment.

#### Scenario: Prod image boots without a database
- **WHEN** the prod image serves `/healthz`
- **THEN** it responds 200 with no DB configured

#### Scenario: Pinned images everywhere
- **WHEN** the tree is grepped for `16-alpine` or `redis:7-alpine` in compose files and test fixtures
- **THEN** nothing matches; `postgres:17-alpine` and `valkey/valkey:9-alpine` are centralized in Makefile `?=` variables (`POSTGRES_IMAGE`, `REDIS_IMAGE`) and consumed via `${VAR:-default}` interpolation, so a single variable change propagates to all consumers

#### Scenario: Data services via make
- **WHEN** a developer runs `make db-up`
- **THEN** only `db` + `redis` start healthy (Postgres 17 + Valkey 9), ready for local migrate/api/test

#### Scenario: CI database tooling tracks the server major
- **WHEN** `POSTGRES_IMAGE` moves to a new major
- **THEN** the CI `integration` job installs the matching `postgresql-client-<major>` (pg_dump aborts on major mismatch)

