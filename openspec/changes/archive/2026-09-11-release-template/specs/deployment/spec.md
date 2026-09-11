## ADDED Requirements

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
