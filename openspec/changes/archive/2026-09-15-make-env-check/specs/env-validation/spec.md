## ADDED Requirements

### Requirement: Env drift is reported without leaking values

The repo SHALL report `.env` drift (keys missing vs `.env.example`, extra keys, malformed values mirroring `Settings` validators) naming only key names — never values — with exit `0` clean, `1` drift-or-invalid, `2` file missing; `make setup` SHALL run the check before migrating.

#### Scenario: Stale dev env
- **WHEN** `.env` lacks keys present in `.env.example`
- **THEN** `make env-check` lists exactly those key names and exits 1, printing no value.

#### Scenario: Malformed value
- **WHEN** `SECRET_KEY` is short or `TENANCY_MODE` is unknown
- **THEN** the report names the key with the reason and exits 1, printing no value.
