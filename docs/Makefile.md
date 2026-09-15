# Makefile — complete script documentation

> 🇬🇧 English | [Português (BR)](Makefile.pt-BR.md)
>
> `make help` is the index. This doc is the manual: what each target does,
> why it exists, how it works, and how to fill its parameters. Standard
> enforced by skill `makefile-keeper`.

## Variables (fork points — override, don't edit)

| Variable | Default | What it does | Example |
|---|---|---|---|
| `UV` | `uv` | Python package runner | `make sync UV=uvx` (never needed normally) |
| `COMPOSE` | `docker compose` | Container orchestration | `make up COMPOSE="podman compose"` |
| `ENV_FILE` | `.env` | Env file consumed by `_check-env` | `make up ENV_FILE=.env.staging` |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | `api` bind address | `make api PORT=9000` |
| `WORKERS` | `2` | Taskiq `worker` concurrency | `make worker WORKERS=4` |
| `STACK_SERVICES` | `db redis` | Services `db-reset` recreates | `make db-reset STACK_SERVICES="db redis minio"` |
| `BUILD_TARGET` | `prod` | Dockerfile stage for `build` | `make build BUILD_TARGET=dev` |
| `IMAGE` / `TAG` | `fast-backend` / `dev` | Image name for `build` (never `:latest`) | `make build IMAGE=ghcr.io/org/app TAG=abc1234` |
| `BACKUP_DIR` | `./var/backups` | `backup` destination | `make backup BACKUP_DIR=/mnt/backups` |
| `POSTGRES_IMAGE` / `REDIS_IMAGE` | `postgres:17-alpine` / `valkey/valkey:9-alpine` | Pinned data-service images (single source of truth; RULES §10) | `make db-up POSTGRES_IMAGE=postgres:18-alpine` |
| `DOCKER` | `docker` | Daemon CLI used by test fixtures | `make test-integration DOCKER=podman` (fixtures read `DOCKER_BIN`) |
| `NPM` / `CLIENT_DIR` / `WEB_PORT` | `npm` / `client` / `5173` | Frontend dev server knobs | `make web WEB_PORT=3000` |
| `CONFIRM` | *(empty)* | Acknowledgement for destructive targets | `make db-reset CONFIRM=1` |
| `msg` / `f` / `rev` | *(empty)* | Required args: migration message, test file, downgrade revision | `make migration msg="..."` |
| `FILE` | *(empty)* | Restore artifact path | `make restore FILE=... CONFIRM=1` |
| `name` / `dest` | *(empty)* | `new-project` name and destination | `make new-project name=x dest=../x` |
| `v` | *(empty)* | `release-notes` version | `make release-notes v=v1.1.0` |

Secrets and URLs (`DATABASE_URL`, `BACKUP_PASSPHRASE`, …) always come from the
environment, never from Makefile variables or files.

## Setup — first run

- **`make setup`** — *What:* bootstraps a fresh clone end-to-end. *Why:* one
  command from zero to working (env + deps + schema). *How:* runs
  `env-template` → `sync` → `migrate` in order. No parameters.
- **`make sync`** — *What:* installs locked deps (`uv sync --extra dev`).
  *Why:* `pyproject.toml` + `uv.lock` are the single source of truth (never
  `pip install`). No parameters.
- **`make env-template`** — *What:* copies `.env.example` → `.env`.
  *Why:* `.env` holds real secrets and is gitignored; the template tracks the
  schema. *How to fill:* nothing — but it **never overwrites** an existing
  `.env` (safe to re-run).

## Database — schema and inspection

- **`make migrate`** — *What:* applies pending migrations (`alembic upgrade
  head`). *Why:* schema changes ship as migrations, never by hand.
- **`make migration msg="..."`** — *What:* creates an `autogenerate`
  migration. *Why:* captures model diffs. *Param* `msg` (required): short
  imperative message. *After:* review the generated SQL, then `make migrate`.
- **`make downgrade [rev=]`** — *What:* rolls back one revision (`rev=base`
  rolls back everything). *Why:* undo a bad migration locally. *Param* `rev`
  (optional, default `-1`).
- **`make db-current` / `make db-history`** — *What:* show applied version /
  full history. *Why:* "which schema am I on?" before debugging.
- **`make db-shell`** — *What:* opens `psql` on `DATABASE_URL`. *Why:*
  inspection/debugging. *How:* strips the async dialect marker (`+asyncpg`)
  that `psql` doesn't understand. Needs `DATABASE_URL` exported.
- **`make db-reset CONFIRM=1`** — *What:* destroys local volumes, recreates
  `$(STACK_SERVICES)`, migrates. *Why:* clean-slate dev DB.
  *(⚠️ DESTRUCTIVE — requires `CONFIRM=1`, refuses without it.)*

## Tests — tiers

- **`make test`** — full suite (needs Docker: bridge, or `FB_TEST_NETWORK=host`
  where bridge is blocked — see `make test-host`).
- **`make test-unit`** — fast, no services (`-m unit`).
- **`make test-integration`** — real Postgres+Redis via testcontainers.
- **`make test-host`** — full suite with `FB_TEST_NETWORK=host` for sandboxes
  without veth networking.
- **`make test-file f=<path>`** — single file. *Param* `f` (required):
  `make test-file f=app/tests/unit/test_jwt.py`.
- **`make clean`** — removes caches (`__pycache__`, `.pytest_cache`,
  `.ruff_cache`, `.mypy_cache`). Safe: never touches source.

## Verify — gates (mirror of CI)

- **`make lint`** — `ruff check` + `format --check` on `app scripts`.
- **`make format-fix`** — auto-fix + format (mutates the tree; never in CI).
- **`make types`** — `mypy app scripts`.
- **`make arch`** — `lint-imports`: 12 contracts (layers, DAG, boundaries).
- **`make security`** — `bandit -r app scripts -q -ll` (0 Medium+ gate) +
  `pip-audit` + `gitleaks`.
- **`make verify`** — all static gates (`lint` + `types` + `arch`).
- **`make check`** — local PR gate (`verify` + `test-unit`). Run before push.

## Docker — local stack

- **`make up`** — app + worker + db + redis (needs `.env`; `_check-env`
  fails fast telling you to run `make env-template`).
- **`make db-up`** — db + redis only (data services for local dev: migrate/api/test against them).
- **`make down`** — stops everything, keeps volumes. **`make restart`** — `down` + `up`.
- **`make logs` / `logs-app` / `logs-db`** — follow logs (all / app / postgres).
- **`make tools`** — mailpit + minio profiles (dev email capture, S3 testing).
- **`make build [IMAGE=… TAG=…]`** — prod image (default `fast-backend:dev`).
  Never tag `:latest` (rollback needs immutable `:sha`).

## Run — dev processes

- **`make api [PORT=]`** — uvicorn with reload + app factory
  (`http://127.0.0.1:8000/docs`).
- **`make worker [WORKERS=]`** — `taskiq worker app.worker:broker`.
- **`make web-install`** — `npm ci` inside `$(CLIENT_DIR)` (shell-agnostic, works on Windows cmd too).
- **`make web [WEB_PORT=]`** — Vite dev server (`http://localhost:5173`). Needs `client/.env` (`VITE_API_URL`) and backend CORS allowing the origin.

## Ops — backups, scaffolding, releases

- **`make backup`** — encrypted backup to `$(BACKUP_DIR)`. Needs
  `BACKUP_PASSPHRASE` and `DATABASE_URL` in the environment (fails fast
  naming the missing one).
- **`make restore FILE=<artifact> CONFIRM=1`** — restores an artifact.
  *Params:* `FILE` (required), `CONFIRM=1` (required).
  *(⚠️ DESTRUCTIVE — overwrites the database.)*
- **`make new-project name=<kebab> dest=<dir>`** — scaffolds a sibling
  project (copies tree minus VCS/venvs/caches, renames). Both params required.
- **`make release-notes v=<vX.Y.Z>`** — prints the CHANGELOG section for a
  version (feeds `gh release create`). Fails without a matching section —
  that's the gate working, not a bug.

## Meta

- **`make change name=<kebab>`** — scaffolds `openspec/changes/<name>/`
  (proposal before code, per `AGENTS.md`).
- **`make help`** — this index (default goal). **`make help-unclassified`** —
  audit: targets with `##` but no `##@` section; must print nothing.

## Destructive targets (complete list)

`db-reset`, `restore`. Both refuse without `CONFIRM=1` and carry
`(⚠️ DESTRUCTIVE)` in `make help`. CI never invokes them.

## Customizing (keeping the standard)

1. Prefer overrides (`make api PORT=9000`) over edits.
2. New target: kebab-case, one-line `##` (what it affects + inline example),
   `##@` section above, `.PHONY` entry. Logic >5 lines → `scripts/`.
3. New section: `##@` emoji header; keep include order = help order
   (single-file Makefile here — no `include`s to order).
4. New env knob: `?=` default + document in this file's table + `.env.example`.

## CI relationship

CI (`.github/workflows/ci.yml`) calls the **same** targets (`lint`, `types`,
`arch`, `test-unit`, `test-integration`, `security`) — never duplicated
commands. Drift either way is a bug: fix the Makefile or the workflow.
