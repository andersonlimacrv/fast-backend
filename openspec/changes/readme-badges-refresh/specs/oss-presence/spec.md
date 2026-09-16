## MODIFIED Requirements

### Requirement: Professional README and OSS files

The repo SHALL present grouped badges (status, stack with logos, test tiers without aging numbers), TOC, quickstart, a CHANGELOG pointer and a disk-synced Structure tree, and link CONTRIBUTING, SECURITY, issue/PR templates; no stale placeholder docs may remain.

#### Scenario: Visitor onboarding
- **WHEN** someone opens the repo root
- **THEN** badges, setup (<10 min path), structure, and contribution entry points are visible without opening other files

#### Scenario: No false docs
- **WHEN** the tree is grepped for known-stale strings ("nenhum workflow", "cache?", old counts)
- **THEN** nothing matches

#### Scenario: Make-first onboarding
- **WHEN** someone opens the repo root README
- **THEN** Getting started, Test/verify, Build/deploy, Backup sections show `make` commands first (`make setup`, `make api`/`make up`, `make test-unit`/`make check`, `make build`, `make backup`) with the raw equivalent visible under "Under the hood", all matching the real `Makefile` recipes, linking `make help` and `docs/Makefile.md` as the manual

#### Scenario: No stale raw-first docs
- **WHEN** the README is grepped for canonical raw commands (`uv sync --extra dev`, `uvicorn app.main:create_app`, `python scripts/new_project.py`) as the primary instruction
- **THEN** they appear only as documented fallback/under-the-hood, never as the headline

#### Scenario: Badges resolve and carry no aging numbers
- **WHEN** every badge image URL is fetched
- **THEN** all return 200 and none carries a hardcoded test count.
