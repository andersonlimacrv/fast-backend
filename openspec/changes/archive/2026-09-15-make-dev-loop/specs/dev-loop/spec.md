## ADDED Requirements

### Requirement: Single-command dev loop

The repo SHALL provide `make dev` (backend stack via compose + foreground Vite, with fast-failing guards for `.env`/`client/.env` and a CORS hint) and `make dev-down` (stop stack, keep volumes).

#### Scenario: Missing frontend env
- **WHEN** `client/.env` is absent
- **THEN** `make dev` exits non-zero naming `client/.env` before starting anything.

#### Scenario: Happy path
- **WHEN** envs exist and Docker is up
- **THEN** `:8000/healthz` answers ok AND `:5173` serves the SPA against that API.
