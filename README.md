# fast-backend

> 🇬🇧 **English** | [Português (BR)](README.pt-BR.md) — deep docs (`docs/`) are in PT-BR for now.

[![CI](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/andersonlimacrv/fast-backend)](https://github.com/andersonlimacrv/fast-backend/releases)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue)](pyproject.toml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-98%20passing-brightgreen)](app/tests)

Modular Monolith Async FastAPI SaaS Kernel — own auth (JWT + opaque refresh), row-level tenancy, RBAC + entitlements, email/storage/jobs, audit, backup, and optional Stripe billing.

> **Status: v1.0.0 shipped** (tag `0.1.0`) — Phases 0–8 done, 98 green tests, 20 capabilities in `openspec/specs/`.

## Contents

- [Getting started](#getting-started)
- [Test / verify](#test--verify)
- [Build / deploy](#build--deploy)
- [Backup](#backup)
- [New project from here](#new-project-from-here)
- [Structure](#structure)
- [Architecture & scaling](#architecture--scaling)
- [Contributing](#contributing)
- [License](#license)

## Getting started

```bash
cp .env.example .env
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --reload
# → http://127.0.0.1:8000/docs
```

With Docker (app + worker + postgres + redis; `tools` for mailpit/minio):

```bash
cp .env.example .env
docker compose up --build
docker compose --profile tools up --build
```

## Test / verify

```bash
uv run pytest -m "unit"                       # fast, no services
uv run pytest -m "integration"                # real Postgres+Redis (testcontainers)
FB_TEST_NETWORK=host uv run pytest            # where Docker bridge is blocked
uv run ruff check app scripts && uv run ruff format --check app scripts
uv run mypy app scripts
uv run lint-imports                            # module DAG
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git
```

## Build / deploy

```bash
docker build --target prod -t ghcr.io/<org>/fast-backend:<sha> .
IMAGE=ghcr.io/<org>/fast-backend:<sha> docker compose -f docker-compose.prod.yml up -d
```

Push to `main` deploys via `.github/workflows/deploy.yml` (migrate → `/readyz` healthcheck → automatic rollback). Manual rollback: `rollback.yml` with the SHA. Details in `docs/DEPLOYMENT.md`.

## Backup

```bash
BACKUP_PASSPHRASE=... python scripts/backup.py --database-url ... --dest ./var/backups
python scripts/backup.py --restore <artifact> --database-url ...
```

## New project from here

```bash
python scripts/new_project.py --name my-saas --dest /path/to/my-saas
```

## Structure

```text
app/                  # package (imports from app.*)
├── core/             # errors, settings, security port, contracts/
├── infrastructure/   # auth, db, email, storage, jobs, observability, payments, security
├── modules/          # identity, organization, tenancy, entitlements, projects, audit, billing_stripe
├── interfaces/       # errors, health (/healthz, /readyz)
├── migrations/       # Alembic 0001–0005
└── tests/            # unit, integration, e2e, fixtures
scripts/              # backup.py, deploy.py, new_project.py, release_notes.py
openspec/             # specs (20 capabilities) + archived changes
docs/                 # RULES, ROADMAP, ARCHITECTURE, SCALING, DEPLOYMENT, guides/, ADRs
```

Run `make help` for every command (documented in `docs/Makefile.md`).

## Skills

Agent skills shipped in `.opencode/skills/` (see `docs/SKILLS-REGISTRY.md`):

- `openspec-*` — spec-driven workflow (propose/verify/archive changes).
- `documentation-and-adrs`, `docs-generate` — feed README/API/ADR/CHANGELOG from code.
- `git-workflow-and-versioning`, `shipping-and-launch`, `ci-cd-and-automation` — releases, changelogs, pipelines.
- `cmd-makefile`, `writing-makefiles` — Makefile base references.
- `makefile-keeper` — keeps this repo's Makefile on standard.

## Architecture & scaling

- `docs/ARCHITECTURE.md` — module map, DAG, flows, ADR index.
- `docs/SCALING.md` — real knobs, vertical-first order, future triggers.
- `docs/guides/add-module.md` — create a module in 5 steps.
- Rules: `AGENTS.md` (read before coding) → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*` → `references/*` (frozen). No `backend/` — the app directory is `app/`.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Summary: OpenSpec change before relevant code, Conventional Commits, green gates, no secrets. Vulnerabilities: [`SECURITY.md`](SECURITY.md) (don't open a public issue).

## License

MIT — see `LICENSE`.
