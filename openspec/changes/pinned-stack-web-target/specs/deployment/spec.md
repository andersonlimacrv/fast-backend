## MODIFIED Requirements

### Requirement: Local and prod compose parity

The system SHALL boot the full stack from compose files with one command per environment, using pinned data-service images (`postgres:17-alpine`, `valkey/valkey:9-alpine`) centralized in Makefile `?=` variables (`POSTGRES_IMAGE`, `REDIS_IMAGE`) and consumed via `${VAR:-default}` interpolation, with identical pins in dev, prod, and test fixtures.

#### Scenario: Pinned images everywhere
- **WHEN** the tree is grepped for `16-alpine` or `redis:7-alpine` in compose files and test fixtures
- **THEN** nothing matches; a single Makefile variable change propagates to all consumers

#### Scenario: Data services via make
- **WHEN** a developer runs `make db-up`
- **THEN** only `db` + `redis` start healthy (Postgres 17 + Valkey 9), ready for local migrate/api/test
