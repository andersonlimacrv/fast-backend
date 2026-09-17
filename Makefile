# fast-backend — single entry point for every repo command.
# `make help` lists everything. Logic lives in scripts/, never inline here.
#
# FORK GUIDE (reusing this boilerplate): override `?=` variables on the command
# line or environment instead of editing recipes — e.g. `make api PORT=9000`,
# `make build IMAGE=myorg/app TAG=abc1234`, `make worker WORKERS=4`.
# Only edit this file to add/remove targets (skill `makefile-keeper`).
# Conventions: docs/Makefile.md.
#
# Safety: destructive targets require CONFIRM=1 and carry (⚠️ DESTRUCTIVE).

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
.DEFAULT_GOAL := help

# --- Fork points (override, don't edit) ---
UV ?= uv
COMPOSE ?= docker compose
DOCKER ?= docker
ENV_FILE ?= .env
HOST ?= 127.0.0.1
PORT ?= 8000
WORKERS ?= 2
STACK_SERVICES ?= db redis
BUILD_TARGET ?= prod
IMAGE ?= fast-backend
TAG ?= dev
BACKUP_DIR ?= ./var/backups
POSTGRES_IMAGE ?= postgres:17-alpine
REDIS_IMAGE ?= valkey/valkey:9-alpine
E2E_PG_PORT ?= 5434
E2E_REDIS_PORT ?= 6380
E2E_API_PORT ?= 8001
E2E_WEB_PORT ?= 5174
E2E_DATABASE_URL ?= postgresql+asyncpg://postgres:postgres@127.0.0.1:$(E2E_PG_PORT)/fastbackend
E2E_REDIS_URL ?= redis://127.0.0.1:$(E2E_REDIS_PORT)/0
E2E_TASK_BROKER_URL ?= redis://127.0.0.1:$(E2E_REDIS_PORT)/1
NPM ?= npm
CLIENT_DIR ?= client
WEB_PORT ?= 5173
# Single source of truth for data-service images: `make up IMAGE=x` flows to
# compose files (`${VAR:-default}`) and test fixtures alike.
COMPOSE_ENV = POSTGRES_IMAGE=$(POSTGRES_IMAGE) REDIS_IMAGE=$(REDIS_IMAGE) E2E_PG_PORT=$(E2E_PG_PORT) E2E_REDIS_PORT=$(E2E_REDIS_PORT)

##@ 🚀 Setup

setup: env-template sync env-check migrate ## First run: .env + deps + drift check + migrations

sync: ## Install deps from lockfile (`uv sync --extra dev`)
	$(UV) sync --extra dev

env-template: ## Create .env from .env.example (never overwrites)
	@if [ -f $(ENV_FILE) ]; then \
		echo ".env already exists — leaving it alone"; \
	elif [ ! -f .env.example ]; then \
		echo ".env.example not found"; exit 1; \
	else \
		cp .env.example $(ENV_FILE); \
		echo "Created $(ENV_FILE) — fill in real values"; \
	fi

env-check: ## Validate .env vs .env.example (keys + shapes, never prints values)
	$(UV) run python scripts/env_check.py

_check-env:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo ".env not found — run 'make env-template'"; exit 1; \
	fi

_check-web-env:
	@if [ ! -f $(CLIENT_DIR)/.env ]; then \
		echo "$(CLIENT_DIR)/.env not found — copy $(CLIENT_DIR)/.env.example (VITE_API_URL=http://localhost:8000)"; exit 1; \
	fi

##@ 🗄️ Database

migrate: ## Apply migrations (`alembic upgrade head`)
	$(UV) run alembic upgrade head

migration: ## New migration (make migration msg="add users table")
	@if [ -z "$(msg)" ]; then echo "Usage: make migration msg=\"...\""; exit 1; fi
	$(UV) run alembic revision --autogenerate -m "$(msg)"

downgrade: ## Roll back one migration (make downgrade / make downgrade rev=base)
	$(UV) run alembic downgrade $(or $(rev),-1)

db-current: ## Show current migration version
	$(UV) run alembic current

db-history: ## Show migration history
	$(UV) run alembic history

db-shell: ## Open psql on DATABASE_URL (strips async dialect marker)
	$(UV) run python -c "import os,sys; u=os.environ.get('DATABASE_URL',''); u=u.replace('+asyncpg','').replace('+psycopg','').replace('+psycopg2',''); os.execvp('psql', ['psql', u]) if u else sys.exit('Set DATABASE_URL first')"

db-reset: _check-env ## Destroy volumes, recreate, migrate (⚠️ DESTRUCTIVE)
	@if [ -z "$(CONFIRM)" ]; then \
		echo "⚠️  Destroys local volumes. Re-run with CONFIRM=1"; exit 1; \
	fi
	$(COMPOSE_ENV) $(COMPOSE) down -v
	$(COMPOSE_ENV) $(COMPOSE) up -d $(STACK_SERVICES)
	$(UV) run alembic upgrade head

##@ 🧪 Tests

test: ## Full suite (needs Docker; bridge or FB_TEST_NETWORK=host)
	$(UV) run pytest

test-unit: ## Fast tests, no services
	$(UV) run pytest -m "unit"

test-integration: ## Postgres+Redis via testcontainers
	DOCKER_BIN=$(DOCKER) POSTGRES_IMAGE=$(POSTGRES_IMAGE) REDIS_IMAGE=$(REDIS_IMAGE) $(UV) run pytest -m "integration"

test-host: ## Full suite where Docker bridge is blocked
	FB_TEST_NETWORK=host $(UV) run pytest

e2e: ## SPA-equivalent flow vs running API (needs `make api` + migrated db)
	$(UV) run python scripts/e2e_spa_flow.py

test-file: ## Single file (make test-file f=app/tests/unit/test_jwt.py)
	@if [ -z "$(f)" ]; then echo "Usage: make test-file f=<path>"; exit 1; fi
	$(UV) run pytest $(f)

clean: ## Remove caches and artifacts (safe: source untouched)
	find app scripts -type d -name "__pycache__" -prune -exec rm -rf {} +
	rm -rf .pytest_cache .ruff_cache .mypy_cache

##@ 🛠️ Verify

lint: ## ruff check + format check
	$(UV) run ruff check app scripts
	$(UV) run ruff format --check app scripts

format-fix: ## Auto-format code
	$(UV) run ruff check --fix app scripts
	$(UV) run ruff format app scripts

types: ## mypy strict-ish
	$(UV) run mypy app scripts

arch: ## Module DAG + boundaries (`import-linter`, 13 contracts)
	$(UV) run lint-imports

security: ## bandit (0 Medium+) + pip-audit + gitleaks
	$(UV) run bandit -r app scripts -q -ll
	$(UV) run pip-audit
	gitleaks detect --source . --no-git

verify: lint types arch ## All static gates (lint + types + architecture)

check: verify test-unit ## Local PR gate (static + fast tests)

##@ 🐳 Docker

up: _check-env ## Start app + worker + db + redis
	$(COMPOSE_ENV) $(COMPOSE) up -d --build

db-up: _check-env ## Start db + redis only (data services for local dev)
	$(COMPOSE_ENV) $(COMPOSE) up -d $(STACK_SERVICES)

dev: _check-env _check-web-env db-up migrate up ## Full dev loop: backend stack (docker) + frontend (Ctrl+C stops vite; `make dev-down` stops stack)
	@if ! grep -q "$(WEB_PORT)" $(ENV_FILE); then \
		echo "hint: $(ENV_FILE) may not allow http://localhost:$(WEB_PORT) — add it to CORS_ORIGINS"; \
	fi
	@echo "API: http://127.0.0.1:$(PORT)/docs | SPA: http://localhost:$(WEB_PORT) | stop stack: make dev-down"
	cd $(CLIENT_DIR) && $(NPM) run dev -- --port $(WEB_PORT) --strictPort

dev-down: ## Stop the dev stack (keeps volumes)
	$(COMPOSE) down

down: ## Stop everything (keeps volumes)
	$(COMPOSE) down

logs: ## Follow all logs
	$(COMPOSE) logs -f

logs-app: ## Follow app logs only
	$(COMPOSE) logs -f app

logs-db: ## Follow postgres logs only
	$(COMPOSE) logs -f db

restart: down up ## Rebuild and restart everything

tools: _check-env ## Start mailpit + minio profiles
	$(COMPOSE_ENV) $(COMPOSE) --profile tools up -d --build

build: ## Build prod image (IMAGE=... TAG=..., never :latest)
	docker build --target $(BUILD_TARGET) -t "$(IMAGE):$(TAG)" .

##@ 🏃 Run

api: ## API with reload (http://127.0.0.1:8000/docs)
	$(UV) run uvicorn app.main:create_app --factory --host $(HOST) --port $(PORT) --reload

worker: ## Taskiq worker (WORKERS=2)
	$(UV) run taskiq worker app.worker:broker --workers $(WORKERS)

web-install: ## Install frontend deps (`npm ci` in client/)
	cd $(CLIENT_DIR) && $(NPM) ci

web: ## Frontend dev server (http://localhost:5173, WEB_PORT=...)
	cd $(CLIENT_DIR) && $(NPM) run dev -- --port $(WEB_PORT) --strictPort

web-lint: ## Frontend lint (`oxlint` in client/)
	cd $(CLIENT_DIR) && $(NPM) run lint

web-test: ## Frontend tests (`vitest run` in client/)
	cd $(CLIENT_DIR) && $(NPM) run test:run

web-build: ## Frontend production build (`tsc` + `vite build` in client/)
	cd $(CLIENT_DIR) && $(NPM) run build

web-e2e-install: ## Install Playwright Chromium (version follows client/package.json)
	cd $(CLIENT_DIR) && $(NPM) exec playwright install chromium

web-e2e: ## Browser E2E vs DEV api (legacy: pollutes the dev DB — prefer `make e2e-full`)
	cd $(CLIENT_DIR) && $(NPM) run e2e

e2e-db-up: ## Start isolated e2e data services (postgres + redis, own ports/volumes)
	$(COMPOSE_ENV) $(COMPOSE) --profile e2e up -d db-e2e redis-e2e

e2e-db-down: ## Stop e2e data services (keeps volumes for fast reruns)
	$(COMPOSE) stop db-e2e redis-e2e

e2e-clean: ## Remove e2e containers (volumes persist; purge data via docker volume rm)
	$(COMPOSE) rm -sf db-e2e redis-e2e

e2e-migrate: ## Migrate the isolated e2e database
	DATABASE_URL="$(E2E_DATABASE_URL)" $(UV) run alembic upgrade head

e2e-api: ## API for e2e in background (E2E_API_PORT; kill with `make e2e-stop`)
	mkdir -p var
	DATABASE_URL="$(E2E_DATABASE_URL)" REDIS_URL="$(E2E_REDIS_URL)" TASK_BROKER_URL="$(E2E_TASK_BROKER_URL)" CORS_ORIGINS='["http://localhost:$(E2E_WEB_PORT)"]' nohup $(UV) run uvicorn app.main:create_app --factory --host $(HOST) --port $(E2E_API_PORT) > var/e2e-api.log 2>&1 & echo $$! > var/e2e-api.pid

e2e-stop: ## Stop the e2e API + data services (keeps volumes)
	@if [ -f var/e2e-api.pid ]; then pid=$$(cat var/e2e-api.pid); kill "$$pid" 2>/dev/null || true; taskkill //F //T //PID "$$pid" 2>/dev/null || true; rm -f var/e2e-api.pid; fi
	$(COMPOSE) stop db-e2e redis-e2e

e2e-build: ## Frontend production build pointed at the e2e API
	cd $(CLIENT_DIR) && VITE_API_URL="http://127.0.0.1:$(E2E_API_PORT)" $(NPM) run build

e2e-full: ## Isolated browser E2E end-to-end (own DB/API/preview; teardown after; dev DB untouched)
	@set -e; trap '$(MAKE) e2e-stop >/dev/null 2>&1' EXIT INT TERM; \
	$(COMPOSE_ENV) $(COMPOSE) --profile e2e up -d db-e2e redis-e2e; \
	for i in $$(seq 1 60); do \
		$(COMPOSE) --profile e2e exec -T db-e2e pg_isready -U postgres >/dev/null 2>&1 && break; \
		sleep 1; \
	done; \
	DATABASE_URL="$(E2E_DATABASE_URL)" $(UV) run alembic upgrade head; \
	VITE_API_URL="http://127.0.0.1:$(E2E_API_PORT)" $(NPM) --prefix $(CLIENT_DIR) run build; \
	mkdir -p var; \
	DATABASE_URL="$(E2E_DATABASE_URL)" REDIS_URL="$(E2E_REDIS_URL)" TASK_BROKER_URL="$(E2E_TASK_BROKER_URL)" CORS_ORIGINS='["http://localhost:$(E2E_WEB_PORT)"]' nohup $(UV) run uvicorn app.main:create_app --factory --host $(HOST) --port $(E2E_API_PORT) > var/e2e-api.log 2>&1 & echo $$! > var/e2e-api.pid; \
	E2E_API_URL="http://127.0.0.1:$(E2E_API_PORT)" WEB_PORT=$(E2E_WEB_PORT) $(NPM) --prefix $(CLIENT_DIR) run e2e; \
	status=$$?; $(MAKE) e2e-stop >/dev/null 2>&1; exit $$status

web-e2e-update: ## Refresh linux baselines ONLY via web-e2e-baselines.yml (never commit local win32/)
	cd $(CLIENT_DIR) && $(NPM) run e2e -- --update-snapshots

##@ 🛫 Ops

backup: ## Encrypted backup to BACKUP_DIR (needs BACKUP_PASSPHRASE)
	@if [ -z "$${BACKUP_PASSPHRASE:-}" ]; then echo "Set BACKUP_PASSPHRASE first"; exit 1; fi
	$(UV) run python scripts/backup.py --database-url "$${DATABASE_URL:?}" --dest $(BACKUP_DIR)

restore: ## Restore artifact (make restore FILE=<artifact>) (⚠️ DESTRUCTIVE)
	@if [ -z "$(FILE)" ]; then echo "Usage: make restore FILE=<artifact>"; exit 1; fi
	@if [ -z "$(CONFIRM)" ]; then \
		echo "⚠️  Overwrites the database. Re-run with CONFIRM=1 FILE=$(FILE)"; exit 1; \
	fi
	@if [ -z "$${BACKUP_PASSPHRASE:-}" ]; then echo "Set BACKUP_PASSPHRASE first"; exit 1; fi
	$(UV) run python scripts/backup.py --restore "$(FILE)" --database-url "$${DATABASE_URL:?}"

new-project: ## Scaffold sibling (make new-project name=x dest=../x)
	@if [ -z "$(name)" ] || [ -z "$(dest)" ]; then echo "Usage: make new-project name=<kebab> dest=<dir>"; exit 1; fi
	$(UV) run python scripts/new_project.py --name "$(name)" --dest "$(dest)"

admin-bootstrap: ## Create the one-shot root user (BOOTSTRAP_KEY from env, never logs secrets)
	$(UV) run python scripts/bootstrap_root.py

release-notes: ## Notes for a version (make release-notes v=v1.1.0)
	@if [ -z "$(v)" ]; then echo "Usage: make release-notes v=vX.Y.Z"; exit 1; fi
	$(UV) run python scripts/release_notes.py --version "$(v)"

##@ 📦 Meta

change: ## New OpenSpec change (make change name=my-change)
	@if [ -z "$(name)" ]; then echo "Usage: make change name=<kebab-case>"; exit 1; fi
	openspec new change "$(name)"

##@ ❓ Help

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

help-unclassified: ## Targets with ## but no ##@ section above (audit, must be empty)
	@awk 'FNR == 1 { section = "" } /^##@ / { section = substr($$0, 5); next } /^[a-zA-Z0-9_-]+:.*## / && section == "" { print "  " $$0 }' $(MAKEFILE_LIST)

.PHONY: setup sync env-template env-check migrate migration downgrade db-current db-history db-shell db-reset
.PHONY: test test-unit test-integration test-host test-file e2e clean
.PHONY: lint format-fix types arch security verify check
.PHONY: up db-up dev dev-down down logs logs-app logs-db restart tools build
.PHONY: api worker web-install web web-lint web-test web-build web-e2e-install web-e2e web-e2e-update
.PHONY: backup restore new-project admin-bootstrap release-notes
.PHONY: change help help-unclassified
