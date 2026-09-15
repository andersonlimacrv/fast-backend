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
- [Frontend (dev)](#frontend-dev)
- [Test / verify](#test--verify)
- [Build / deploy](#build--deploy)
- [Backup](#backup)
- [New project from here](#new-project-from-here)
- [Structure](#structure)
- [Architecture & scaling](#architecture--scaling)
- [Contributing](#contributing)
- [License](#license)

## Getting started

The `Makefile` is the single entry point — run `make help` to list everything (manual in `docs/Makefile.md`).

```bash
make setup   # .env + deps + migrations
make api     # API with reload → http://127.0.0.1:8000/docs
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
make web           # Vite dev → http://localhost:5173
```

<details>
<summary>Under the hood</summary>

```bash
cd client && npm ci
cd client && npm run dev -- --port 5173 --strictPort
```

Needs `client/.env` (`VITE_API_URL=http://localhost:8000`, see `client/.env.example`) and backend `CORS_ORIGINS=["http://localhost:5173"]`. Read-only visualization SPA — details in `client/README.md`.

</details>

## Test / verify

```bash
make test-unit   # fast, no services
make check       # local PR gate: lint + types + arch + unit tests
make test        # full suite (needs Docker)
```

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

## New project from here

```bash
make new-project name=my-saas dest=/path/to/my-saas
```

<details>
<summary>Under the hood</summary>

```bash
python scripts/new_project.py --name my-saas --dest /path/to/my-saas
```

Copies the tree minus VCS/venvs/caches/archives, renames the package, and validates the output.

</details>

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

Run `make help` for every command (manual in `docs/Makefile.md`). Override `?=` variables on the command line instead of editing recipes — e.g. `make api PORT=9000`, `make build IMAGE=myorg/app TAG=abc1234`.

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
