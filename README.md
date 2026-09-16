# fast-backend

> 🇬🇧 **English** | [Português (BR)](README.pt-BR.md) — deep docs (`docs/`) are in PT-BR for now.

<!-- status -->
[![CI](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/andersonlimacrv/fast-backend)](https://github.com/andersonlimacrv/fast-backend/releases)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue)](pyproject.toml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml)
<!-- backend stack -->
![FastAPI](https://img.shields.io/badge/FastAPI-222?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-222?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-222?style=flat-square&logo=redis)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-222?style=flat-square&logo=sqlalchemy)
![Docker](https://img.shields.io/badge/Docker-222?style=flat-square&logo=docker)
<!-- frontend stack -->
![TypeScript](https://img.shields.io/badge/TypeScript-222?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-222?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-222?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-222?style=flat-square&logo=tailwindcss)
<!-- test tiers (measured 2026-09-16: pytest --collect-only 85 unit + 65 integration, vitest json 71, playwright --list 10) -->
![backend-unit](https://img.shields.io/badge/backend_unit-85_tests-0AAAB8?style=flat-square&labelColor=222)
![backend-integration](https://img.shields.io/badge/backend_integration-65_tests-0AAAB8?style=flat-square&labelColor=222)
![client-vitest](https://img.shields.io/badge/client_vitest-71_tests-0AAAB8?style=flat-square&labelColor=222)
![browser-e2e](https://img.shields.io/badge/browser_e2e-10_tests-0AAAB8?style=flat-square&labelColor=222)

Stop rebuilding auth, tenancy, and billing for every SaaS — clone this Argon2id + JWT-rotation + row-tenancy kernel (150 backend tests green on real Postgres/Redis, staff admin + append-only audit + encrypted backups built in) and ship your product in days, not months.

| Release | Tests | Specs | Docs |
|---|---|---|---|
| [`v0.1.1`](https://github.com/andersonlimacrv/fast-backend/releases) (kernel `0.1.0`, Phases 0–11) | 150 backend (85 unit + 65 integration, real Postgres/Redis) + 71 vitest + 10 Playwright | 37 capabilities in [`openspec/specs/`](openspec/specs/) | 12 ADRs in [`docs/adr/`](docs/adr/) |

- **Release notes:** [`CHANGELOG.md`](./CHANGELOG.md) — releases cut automatically on every merged PR ([ADR 0011](docs/adr/0011-auto-release.md)), behavior PRs gated by [`release-check.yml`](.github/workflows/release-check.yml) ([ADR 0012](docs/adr/0012-release-guard.md)).
- **Start here:** [Getting started](#getting-started) (`make setup` → `make dev` → `make check`) · commands manual [`docs/Makefile.md`](docs/Makefile.md).
- **Build on it:** [Generate future code from here](#generate-future-code-from-here) · new module in 5 steps [`docs/guides/add-module.md`](docs/guides/add-module.md) · architecture [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · scaling [`docs/SCALING.md`](docs/SCALING.md).
- **Rules:** `AGENTS.md` → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*` → `references/*` (frozen).

## Contents

1. [Getting started](#getting-started)
2. [Frontend (dev)](#frontend-dev)
3. [Test / verify](#test--verify)
4. [Build / deploy](#build--deploy)
5. [Backup](#backup)
6. [Generate future code from here](#generate-future-code-from-here)
7. [Structure](#structure)
8. [Skills](#skills)
9. [Privacy & LGPD](#privacy--lgpd)
10. [Architecture & scaling](#architecture--scaling)
11. [Contributing](#contributing)
12. [License](#license)

## Getting started

The `Makefile` is the single entry point — run `make help` to list everything (manual in `docs/Makefile.md`).

### 0. Prerequisites

Python ≥3.11, `uv`, Docker, Node 20+ (`npm`), Git.

> Run `make` from **Git Bash** on Windows — the recipes are bash (`!`, `awk` fail under cmd).

### 1. First run — zero to working

```bash
make setup   # .env + deps + drift check + migrations
make dev     # backend stack (docker) + frontend (:5173)
```

- API → http://127.0.0.1:8000/docs · SPA → http://localhost:5173 (`/` public landing, `/~` logged home, `/admin*` staff).
- Needs `client/.env` (`VITE_API_URL=http://localhost:8000`, see `client/.env.example`) and backend `CORS_ORIGINS=["http://localhost:5173"]`.

```bash
make api     # API with reload → http://127.0.0.1:8000/docs (needs db: make db-up)
```

<details>
<summary>Under the hood</summary>

```bash
cp .env.example .env                       # make env-template (never overwrites)
uv sync --extra dev                        # make sync
uv run alembic upgrade head                # make migrate
uv run uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000 --reload  # make api
```

</details>

With Docker (app + worker + postgres + redis; `tools` for mailpit/minio):

```bash
make up      # app + worker + db + redis
make tools   # mailpit + minio profiles
```

<details>
<summary>Under the hood</summary>

```bash
docker compose up -d --build                # make up (needs .env)
docker compose --profile tools up -d --build  # make tools
```

</details>

## Frontend (dev)

```bash
make web-install   # one time: npm ci in client/
make dev           # backend stack + Vite dev → http://localhost:5173 (or `make web` for frontend only)
```

Public landing at `/` (modules, flags, release — works offline), session home at `/~`, two-step login, staff admin at `/admin*`. Privacy notes in `docs/PRIVACY.md`.

<details>
<summary>Under the hood</summary>

```bash
cd client && npm ci
cd client && npm run dev -- --port 5173 --strictPort
```

Needs `client/.env` (`VITE_API_URL=http://localhost:8000`, see `client/.env.example`) and backend `CORS_ORIGINS=["http://localhost:5173"]`. Read-only visualization SPA — details in `client/README.md`.

</details>

## Test / verify

### 2. Verify your setup

```bash
make check       # local PR gate: lint + types + arch + unit tests (run before every push)
make test-unit   # fast, no services
make test        # full suite (needs Docker)
```

Troubleshooting: `.env` drift → `make env-check`; Docker bridge blocked → `FB_TEST_NETWORK=host uv run pytest` (`make test-host`); CORS/blank SPA → check `client/.env` + `CORS_ORIGINS`.

<details>
<summary>Under the hood</summary>

```bash
uv run pytest -m "unit"                       # make test-unit
uv run pytest -m "integration"                # make test-integration (real Postgres+Redis via testcontainers)
FB_TEST_NETWORK=host uv run pytest            # make test-host (where Docker bridge is blocked)
uv run ruff check app scripts && uv run ruff format --check app scripts  # make lint
uv run mypy app scripts                       # make types
uv run lint-imports                            # make arch (module DAG)
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git  # make security
```

</details>

## Build / deploy

```bash
make build IMAGE=ghcr.io/<org>/fast-backend TAG=<sha>
```

<details>
<summary>Under the hood</summary>

```bash
docker build --target prod -t ghcr.io/<org>/fast-backend:<sha> .  # make build (BUILD_TARGET=prod, never :latest)
IMAGE=ghcr.io/<org>/fast-backend:<sha> docker compose -f docker-compose.prod.yml up -d
```

</details>

Push to `main` deploys via `.github/workflows/deploy.yml` (migrate → `/readyz` healthcheck → automatic rollback). Manual rollback: `rollback.yml` with the SHA. Details in `docs/DEPLOYMENT.md`.

## Backup

```bash
make backup              # encrypted backup to ./var/backups (needs BACKUP_PASSPHRASE + DATABASE_URL)
make restore FILE=<artifact> CONFIRM=1
```

<details>
<summary>Under the hood</summary>

```bash
BACKUP_PASSPHRASE=... python scripts/backup.py --database-url ... --dest ./var/backups
python scripts/backup.py --restore <artifact> --database-url ...
```

</details>

## Generate future code from here

Reuse this repo as a template, then generate code the spec-driven way:

```bash
make new-project name=my-saas dest=/path/to/my-saas   # 1. fork: copies tree minus VCS/venvs/caches, renames package
make change name=my-feature                            # 2. spec first: scaffolds openspec/changes/my-feature/ (proposal before code, per AGENTS.md)
make migration msg="add my table" && make migrate      # 3. evolve schema (review autogenerate, then apply)
make check                                             # 4. gate before push (lint + types + arch + unit)
```

New module in 5 steps: `docs/guides/add-module.md`. Full command manual: `docs/Makefile.md`. Behavior PRs must carry a `CHANGELOG.md` entry under `[Unreleased]` (docs-only passes) — see `.github/workflows/release-check.yml`.

## Structure

```text
app/                  # package (imports from app.*)
├── core/             # errors, settings, security port, contracts/
├── infrastructure/   # auth, db, email, storage, jobs, observability, payments, security
├── modules/          # admin, audit, billing_stripe, entitlements, identity, organization, projects, tenancy
├── interfaces/       # errors, health (/healthz, /readyz), meta (/meta)
├── migrations/       # Alembic 0001–0008
└── tests/            # unit, integration, e2e, fixtures
scripts/              # auto_release.py, backup.py, bootstrap_root.py, deploy.py, e2e_spa_flow.py, env_check.py, new_project.py, release_notes.py
openspec/             # specs (36 capabilities) + archived changes
docs/                 # RULES, ROADMAP, ARCHITECTURE, SCALING, DEPLOYMENT, guides/, ADRs
```

Run `make help` for every command (manual in `docs/Makefile.md`). Override `?=` variables on the command line instead of editing recipes — e.g. `make api PORT=9000`, `make build IMAGE=myorg/app TAG=abc1234`.

## Skills

Agent skills shipped in `.opencode/skills/` (see `docs/SKILLS-REGISTRY.md`):

- `openspec-*` — spec-driven workflow (propose/verify/archive changes).
- `documentation-and-adrs`, `docs-generate` — feed README/API/ADR/CHANGELOG from code.
- `git-workflow-and-versioning`, `shipping-and-launch`, `ci-cd-and-automation` — releases, changelogs, pipelines.
- `cmd-makefile`, `writing-makefiles` — Makefile base references.
- `makefile-keeper` — keeps this repo's Makefile on standard.
- `lgpd-*` — LGPD audit bundle (maestro + 18 sub-skills); audit trail in `.lgpd/`.

## Privacy & LGPD

Sanitized by design: Argon2id hashes only (never plaintext), opaque hash-only tokens, no trackers/CDN/fonts in the SPA, audit without secrets (proven by `test_leak_audit.py`). Full inventory, legal bases and retention in [`docs/PRIVACY.md`](docs/PRIVACY.md); audit artifacts in `.lgpd/` (STATUS, data-map, ROPA-track, runbook). This notice is not legal advice — DPO/legal review required before production.

## Architecture & scaling

- `docs/ARCHITECTURE.md` — module map, DAG, flows, ADR index.
- `docs/SCALING.md` — real knobs, vertical-first order, future triggers.
- `docs/guides/add-module.md` — create a module in 5 steps.
- Rules: `AGENTS.md` (read before coding) → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*` → `references/*` (frozen). No `backend/` — the app directory is `app/`.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Summary: OpenSpec change before relevant code, Conventional Commits, green gates, no secrets. Vulnerabilities: [`SECURITY.md`](SECURITY.md) (don't open a public issue).

## License

MIT — see `LICENSE`.
