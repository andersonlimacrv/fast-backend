# design-system-link Specification

## Purpose
TBD - created by archiving change client-reformulation. Update Purpose after archive.
## Requirements
### Requirement: Design system linked and enforced

The repo SHALL keep `docs/DESIGN.md` as the single visual source referenced from `AGENTS.md`, with `ui-designer`/`frontend-implementer`/`design-auditor` agents and the a11y runbook triaged.

#### Scenario: Agent boot finds the chain
- **WHEN** the agent table and `## Design system` are read
- **THEN** three agent files exist and `web-design-guidelines` is triaged with a pinned SHA.

### Requirement: Browser verification harness

The repo SHALL provide `make web-e2e` running Playwright (axe + snapshots, Chromium) with green smoke, wired into CI through the same target.

#### Scenario: Smoke on landing
- **WHEN** `make web-e2e` runs against preview + API
- **THEN** `/` loads AND axe reports no serious/critical violations.

