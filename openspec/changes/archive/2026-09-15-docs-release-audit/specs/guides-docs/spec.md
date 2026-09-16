## ADDED Requirements

### Requirement: Status numbers stay truthful

The repo SHALL keep version/test/spec/phase counts in `README.md` (±pt-BR), `AGENTS.md` and `docs/ROADMAP.md` equal to measured truth (git tags, collected tests, spec dirs, archived changes), and SHALL document the CHANGELOG-at-root decision.

#### Scenario: Audit finds drift
- **WHEN** the periodic docs audit runs
- **THEN** every drifted count is corrected in the same change, with historical sections left untouched.
