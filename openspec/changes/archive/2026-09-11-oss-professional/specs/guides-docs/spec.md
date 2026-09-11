## ADDED Requirements

### Requirement: Code-derived guides

The repo SHALL document architecture (module map, DAG, request flows, ADR index), scaling (knobs with real defaults, vertical-first order, future triggers), and module authoring (5 executable steps) — all traceable to code, not invented.

#### Scenario: Architecture accuracy
- **WHEN** the DAG/contracts change
- **THEN** a reviewer can diff the guide against `lint-imports` output and `app/` tree (guide cites both)

#### Scenario: Scaling knobs are real
- **WHEN** a knob is listed (pool, workers, TTLs, retention)
- **THEN** its default matches `app/core/settings.py` verbatim
