# fast-backend

> 🇧🇷 [English](README.md) | **Português (BR)** — A documentação profunda (`docs/`) está em PT-BR; este README também existe em [inglês](README.md).

[![CI](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/andersonlimacrv/fast-backend)](https://github.com/andersonlimacrv/fast-backend/releases)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue)](pyproject.toml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-98%20passing-brightgreen)](app/tests)

Modular Monolith Async FastAPI SaaS Kernel — auth própria (JWT + refresh opaco), tenancy row-level, RBAC + entitlements, email/storage/jobs, auditoria, backup e billing Stripe opcional.

> **Status: v1.0.0 entregue** (tag `0.1.0`) — Fases 0–8 concluídas, 98 testes verdes, 20 capabilities em `openspec/specs/`.

## Índice

- [Começando](#começando)
- [Testar / verificar](#testar--verificar)
- [Build / deploy](#build--deploy)
- [Backup](#backup)
- [Novo projeto a partir daqui](#novo-projeto-a-partir-daqui)
- [Estrutura](#estrutura)
- [Arquitetura e escala](#arquitetura-e-escala)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Começando

```bash
cp .env.example .env
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --reload
# → http://127.0.0.1:8000/docs
```

Com Docker (app + worker + postgres + redis; `tools` p/ mailpit/minio):

```bash
cp .env.example .env
docker compose up --build
docker compose --profile tools up --build
```

## Testar / verificar

```bash
uv run pytest -m "unit"                       # rápidos, sem serviços
uv run pytest -m "integration"                # Postgres+Redis reais (testcontainers)
FB_TEST_NETWORK=host uv run pytest            # alternativa onde bridge Docker é bloqueada
uv run ruff check app scripts && uv run ruff format --check app scripts
uv run mypy app scripts
uv run lint-imports                            # DAG de módulos
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git
```

## Build / deploy

```bash
docker build --target prod -t ghcr.io/<org>/fast-backend:<sha> .
IMAGE=ghcr.io/<org>/fast-backend:<sha> docker compose -f docker-compose.prod.yml up -d
```

Push na `main` deploya via `.github/workflows/deploy.yml` (migrate → healthcheck `/readyz` → rollback automático). Rollback manual: `rollback.yml` com a SHA. Detalhes em `docs/DEPLOYMENT.md`.

## Backup

```bash
BACKUP_PASSPHRASE=... python scripts/backup.py --database-url ... --dest ./var/backups
python scripts/backup.py --restore <artifact> --database-url ...
```

## Novo projeto a partir daqui

```bash
python scripts/new_project.py --name my-saas --dest /path/to/my-saas
```

## Estrutura

```text
app/                  # pacote (imports from app.*)
├── core/             # errors, settings, security port, contracts/
├── infrastructure/   # auth, db, email, storage, jobs, observability, payments, security
├── modules/          # identity, organization, tenancy, entitlements, projects, audit, billing_stripe
├── interfaces/       # errors, health (/healthz, /readyz)
├── migrations/       # Alembic 0001–0005
└── tests/            # unit, integration, e2e, fixtures
scripts/              # backup.py, deploy.py, new_project.py, release_notes.py
openspec/             # specs (20 capabilities) + changes arquivadas
docs/                 # RULES, ROADMAP, ARCHITECTURE, SCALING, DEPLOYMENT, guides/, ADRs
```

## Arquitetura e escala

- `docs/ARCHITECTURE.md` — mapa de módulos, DAG, fluxos, índice de ADRs.
- `docs/SCALING.md` — knobs reais, ordem vertical-first, gatilhos futuros.
- `docs/guides/add-module.md` — criar um módulo em 5 passos.
- Regras: `AGENTS.md` (leia antes de codar) → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*` → `references/*` (congelada). Sem `backend/` — o diretório da aplicação é `app/`.

## Contribuindo

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md). Resumo: OpenSpec change antes de código relevante, Conventional Commits, gates verdes, sem segredos. Vulnerabilidades: [`SECURITY.md`](SECURITY.md) (não abra issue pública).

## Licença

MIT — ver `LICENSE`.
