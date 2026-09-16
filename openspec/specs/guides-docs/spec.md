# guides-docs Specification

## Purpose
TBD - created by archiving change oss-professional. Update Purpose after archive.
## Requirements
### Requirement: Code-derived guides

The repo SHALL document architecture (module map, DAG, request flows, ADR index), scaling (knobs with real defaults, vertical-first order, future triggers), and module authoring (5 executable steps) — all traceable to code, not invented.

#### Scenario: Architecture accuracy
- **WHEN** the DAG/contracts change
- **THEN** a reviewer can diff the guide against `lint-imports` output and `app/` tree (guide cites both)

#### Scenario: Scaling knobs are real
- **WHEN** a knob is listed (pool, workers, TTLs, retention)
- **THEN** its default matches `app/core/settings.py` verbatim

### Requirement: Status numbers stay truthful

The repo SHALL keep version/test/spec/phase counts in `README.md` (±pt-BR), `AGENTS.md` and `docs/ROADMAP.md` equal to measured truth (git tags, collected tests, spec dirs, archived changes), and SHALL document the CHANGELOG-at-root decision.

#### Scenario: Audit finds drift
- **WHEN** the periodic docs audit runs
- **THEN** every drifted count is corrected in the same change, with historical sections left untouched.

