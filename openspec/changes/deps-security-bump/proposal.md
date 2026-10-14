# deps-security-bump — proposal

## Why

CI `security` job fails deterministically: `pip-audit` reports 18 known
vulnerabilities in 3 locked packages (`multidict` 6.8.0 → CVE-2026-104874,
`pyjwt` 2.13.0 → 14× PYSEC-2026-41xx, `urllib3` 2.7.0 → 3× PYSEC-2026-417x).
Unrelated to any feature diff — pure dependency hygiene, blocking PR #14.

## What Changes

- `pyproject.toml`: `PyJWT>=2.8` → `PyJWT>=2.15` (direct dep; 2.15.0 covers
  all 14 PYSEC items, including the two needing 2.15.0).
- `uv.lock`: regenerated via `uv lock --upgrade-package` for
  `multidict` (→6.9.1), `pyjwt` (→2.15.x), `urllib3` (→2.8.0).
- No code changes expected (compatible bumps); if the solver drags a
  breaking transitive, the change records the constraint instead.

## Non-goals

Bumping anything else; silencing `pip-audit` with ignores; touching tests
to fake green.

## Acceptance criteria

1. `make security` (bandit + `pip-audit`) green locally and in CI.
2. Backend unit suite green; refresh/auth integration subset green
   (proves the JWT bump is behavior-safe).
