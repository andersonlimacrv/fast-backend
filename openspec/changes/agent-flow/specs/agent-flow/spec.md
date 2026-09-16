## ADDED Requirements

### Requirement: Subagent routing is documented and exercised

The repo SHALL document per-agent invocation (`Task` type or runbook fallback), a self-contained prompt recipe, and gate-verified returns in `AGENTS.md`, and SHALL exercise `docs-writer` via `Task` at least once with the outcome recorded.

#### Scenario: Table is complete and honest
- **WHEN** the §5 table is read
- **THEN** all 10 agents carry a correct `Via` value (7 `Task`, 3 runbook).

#### Scenario: Delegation is proven, not claimed
- **WHEN** `readme-badges-refresh` executes
- **THEN** its docs body is delegated to `docs-writer` and the verify records the result.
