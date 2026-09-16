# fast-backend

> 🇧🇷 [English](README.md) | **Português (BR)** — A documentação profunda (`docs/`) está em PT-BR; este README também existe em [inglês](README.md).

<!-- status -->
[![CI](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/andersonlimacrv/fast-backend)](https://github.com/andersonlimacrv/fast-backend/releases)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue)](pyproject.toml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests](https://img.shields.io/github/actions/workflow/status/andersonlimacrv/fast-backend/ci.yml?label=tests&logo=github)](https://github.com/andersonlimacrv/fast-backend/actions/workflows/ci.yml)
<!-- backend stack -->
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker)
<!-- frontend stack -->
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss)
<!-- test tiers -->
![backend-unit](https://img.shields.io/badge/backend--unit-blue?style=flat-square)
![backend-integration](https://img.shields.io/badge/backend--integration-blue?style=flat-square)
![client-vitest](https://img.shields.io/badge/client--vitest-blue?style=flat-square)
![browser-e2e](https://img.shields.io/badge/browser--e2e-blue?style=flat-square)

Modular Monolith Async FastAPI SaaS Kernel — auth própria (JWT + refresh opaco), tenancy row-level, RBAC + entitlements, email/storage/jobs, auditoria, backup, billing Stripe opcional, control plane admin e SPA React de visualização com landing pública.

> **Status: v1.0.0 entregue** (tag `0.1.0`) — Fases 0–11 concluídas, 138 testes verdes de backend (73 unit + 65 integration, Postgres/Redis reais), 71 vitest + 10 testes Playwright em `client/`, 36 capabilities em `openspec/specs/`.
> **Notas de release:** ver [`CHANGELOG.md`](./CHANGELOG.md).
> Releases são geradas automaticamente a cada PR mergeado (ADR 0011).

## Índice

- [Começando](#começando)
- [Frontend (dev)](#frontend-dev)
- [Testar / verificar](#testar--verificar)
- [Build / deploy](#build--deploy)
- [Backup](#backup)
- [Novo projeto a partir daqui](#novo-projeto-a-partir-daqui)
- [Estrutura](#estrutura)
- [Arquitetura e escala](#arquitetura-e-escala)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Começando

O `Makefile` é o ponto único de entrada — rode `make help` para listar tudo (manual em `docs/Makefile.pt-BR.md`).

```bash
make setup   # .env + deps + checagem de drift + migrations
make dev     # loop dev completo: stack backend (docker) + frontend (:5173)
```

> Rode o `make` a partir do **Git Bash** no Windows — as receitas são bash (`!`, `awk` falham sob cmd).

```bash
make api     # API com reload → http://127.0.0.1:8000/docs (precisa do db: make db-up)
```

<details>
<summary>Por baixo dos panos</summary>

```bash
cp .env.example .env                       # make env-template (nunca sobrescreve)
uv sync --extra dev                        # make sync
uv run alembic upgrade head                # make migrate
uv run uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000 --reload  # make api
```

</details>

Com Docker (app + worker + postgres + redis; `tools` p/ mailpit/minio):

```bash
make up      # app + worker + db + redis
make tools   # profiles mailpit + minio
```

<details>
<summary>Por baixo dos panos</summary>

```bash
docker compose up -d --build                # make up (precisa de .env)
docker compose --profile tools up -d --build  # make tools
```

</details>

## Frontend (dev)

```bash
make web-install   # uma vez: npm ci em client/
make dev           # stack backend + Vite dev → http://localhost:5173 (ou `make web` só p/ o frontend)
```

Landing pública em `/`, home logada em `/~`, login two-step, admin em `/admin*` (staff). Notas de privacidade em `docs/PRIVACY.pt-BR.md`.

<details>
<summary>Por baixo dos panos</summary>

```bash
cd client && npm ci
cd client && npm run dev -- --port 5173 --strictPort
```

Precisa de `client/.env` (`VITE_API_URL=http://localhost:8000`, ver `client/.env.example`) e `CORS_ORIGINS=["http://localhost:5173"]` no backend. SPA de visualização read-only — detalhes em `client/README.md`.

</details>

## Testar / verificar

```bash
make test-unit   # rápidos, sem serviços
make check       # gate local de PR: lint + types + arch + testes unitários
make test        # suite completa (precisa de Docker)
```

<details>
<summary>Por baixo dos panos</summary>

```bash
uv run pytest -m "unit"                       # make test-unit
uv run pytest -m "integration"                # make test-integration (Postgres+Redis reais via testcontainers)
FB_TEST_NETWORK=host uv run pytest            # make test-host (onde bridge Docker é bloqueada)
uv run ruff check app scripts && uv run ruff format --check app scripts  # make lint
uv run mypy app scripts                       # make types
uv run lint-imports                            # make arch (DAG de módulos)
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git  # make security
```

</details>

## Build / deploy

```bash
make build IMAGE=ghcr.io/<org>/fast-backend TAG=<sha>
```

<details>
<summary>Por baixo dos panos</summary>

```bash
docker build --target prod -t ghcr.io/<org>/fast-backend:<sha> .  # make build (BUILD_TARGET=prod, nunca :latest)
IMAGE=ghcr.io/<org>/fast-backend:<sha> docker compose -f docker-compose.prod.yml up -d
```

</details>

Push na `main` deploya via `.github/workflows/deploy.yml` (migrate → healthcheck `/readyz` → rollback automático). Rollback manual: `rollback.yml` com a SHA. Detalhes em `docs/DEPLOYMENT.md`.

## Backup

```bash
make backup              # backup criptografado p/ ./var/backups (precisa BACKUP_PASSPHRASE + DATABASE_URL)
make restore FILE=<artefato> CONFIRM=1
```

<details>
<summary>Por baixo dos panos</summary>

```bash
BACKUP_PASSPHRASE=... python scripts/backup.py --database-url ... --dest ./var/backups
python scripts/backup.py --restore <artefato> --database-url ...
```

</details>

## Novo projeto a partir daqui

```bash
make new-project name=my-saas dest=/path/to/my-saas
```

<details>
<summary>Por baixo dos panos</summary>

```bash
python scripts/new_project.py --name my-saas --dest /path/to/my-saas
```

Copia a árvore menos VCS/venvs/caches/archives, renomeia o pacote e valida o resultado.

</details>

## Estrutura

```text
app/                  # pacote (imports from app.*)
├── core/             # errors, settings, security port, contracts/
├── infrastructure/   # auth, db, email, storage, jobs, observability, payments, security
├── modules/          # admin, audit, billing_stripe, entitlements, identity, organization, projects, tenancy
├── interfaces/       # errors, health (/healthz, /readyz), meta (/meta)
├── migrations/       # Alembic 0001–0008
└── tests/            # unit, integration, e2e, fixtures
scripts/              # auto_release.py, backup.py, bootstrap_root.py, deploy.py, e2e_spa_flow.py, env_check.py, new_project.py, release_notes.py
openspec/             # specs (36 capabilities) + changes arquivadas
docs/                 # RULES, ROADMAP, ARCHITECTURE, SCALING, DEPLOYMENT, guides/, ADRs
```

Rode `make help` para todos os comandos (manual em `docs/Makefile.pt-BR.md`). Sobrescreva variáveis `?=` na linha de comando em vez de editar receitas — ex. `make api PORT=9000`, `make build IMAGE=minhaorg/app TAG=abc1234`.

## Skills

Skills de agente em `.opencode/skills/` (ver `docs/SKILLS-REGISTRY.md`):

- `openspec-*` — workflow spec-driven (propose/verify/archive de changes).
- `documentation-and-adrs`, `docs-generate` — alimentam README/API/ADR/CHANGELOG a partir do código.
- `git-workflow-and-versioning`, `shipping-and-launch`, `ci-cd-and-automation` — releases, changelogs, pipelines.
- `cmd-makefile`, `writing-makefiles` — referências base de Makefile.
- `makefile-keeper` — mantém o Makefile deste repo no padrão.
- `lgpd-*` — bundle de auditoria LGPD (maestro + 18 sub-skills); trilha em `.lgpd/`.

## Privacidade e LGPD

Sanitizado por desenho: só hashes Argon2id (nunca texto puro), tokens opacos só-hash, zero trackers/CDN/fontes na SPA, auditoria sem segredos (provado por `test_leak_audit.py`). Inventário completo, bases legais e retenção em [`docs/PRIVACY.pt-BR.md`](docs/PRIVACY.pt-BR.md); artefatos em `.lgpd/` (STATUS, mapa, ROPA-track, runbook). Este aviso não é aconselhamento jurídico — revisão do DPO/jurídico antes da produção.

## Arquitetura e escala

- `docs/ARCHITECTURE.md` — mapa de módulos, DAG, fluxos, índice de ADRs.
- `docs/SCALING.md` — knobs reais, ordem vertical-first, gatilhos futuros.
- `docs/guides/add-module.md` — criar um módulo em 5 passos.
- Regras: `AGENTS.md` (leia antes de codar) → `docs/RULES.md` → `docs/ROADMAP.md` → `docs/adr/*` → `references/*` (congelada). Sem `backend/` — o diretório da aplicação é `app/`.

## Contribuindo

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md). Resumo: OpenSpec change antes de código relevante, Conventional Commits, gates verdes, sem segredos. Vulnerabilidades: [`SECURITY.md`](SECURITY.md) (não abra issue pública).

## Licença

MIT — ver `LICENSE`.
