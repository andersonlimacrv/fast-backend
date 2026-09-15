## MODIFIED Requirements

### Requirement: Professional README and OSS files

The repo SHALL present make-first onboarding in `README.md` (EN) with the underlying raw command disclosed per block ("under the hood"), linking `make help` and `docs/Makefile.md` as the manual instead of duplicating the full target table.

#### Scenario: Make-first onboarding
- **WHEN** someone opens the repo root README
- **THEN** Getting started, Test/verify, Build/deploy, Backup sections show `make` commands first (`make setup`, `make api`/`make up`, `make test-unit`/`make check`, `make build`, `make backup`) with the raw equivalent visible, all matching the real `Makefile` recipes

#### Scenario: No stale raw-first docs
- **WHEN** the README is grepped for canonical raw commands (`uv sync --extra dev`, `uvicorn app.main:create_app`, `python scripts/new_project.py`) as the primary instruction
- **THEN** they appear only as documented fallback/under-the-hood, never as the headline
