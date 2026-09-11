## ADDED Requirements

### Requirement: Readiness reflects dependencies

The system SHALL expose `GET /readyz` returning 200 only when Postgres (`SELECT 1`) and Redis (`PING`) both succeed within timeout, otherwise 503 with per-dependency status.

#### Scenario: All dependencies healthy
- **WHEN** Postgres and Redis respond
- **THEN** `/readyz` returns 200 with `{"status": "ready", "db": "ok", "redis": "ok"}`

#### Scenario: Dependency down
- **WHEN** Redis is unreachable
- **THEN** `/readyz` returns 503 with `{"status": "degraded", "db": "ok", "redis": "fail"}`

### Requirement: Liveness stays dependency-free

The system SHALL keep `GET /healthz` answering 200 without touching any dependency.

#### Scenario: Dependencies down
- **WHEN** Postgres and Redis are both stopped
- **THEN** `/healthz` still returns 200
