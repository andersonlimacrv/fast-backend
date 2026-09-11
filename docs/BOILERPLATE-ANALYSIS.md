# BOILERPLATE-ANALYSIS — Fastro 0.19.0 vs fast-backend v2

> Evidência: `/home/anderson/dev/copy/benavlabs_FastAPI-boilerplate` (`backend/pyproject.toml` v0.19.0) + `/home/anderson/dev/copy/benavlabs_crudauth` (v0.6.0). Nada copiado. Decisões em `docs/adr/*`.

## 1. O que o Fastro é

Workspace `uv` (`backend/` app + `cli/bp` ferramenta), FastAPI async + SQLAlchemy 2.0 + Pydantic v2, Postgres + Alembic, Redis/Memcached (cache + rate-limit), Taskiq (Redis/RabbitMQ), FastCRUD, SQLAdmin opt-in, `crudauth[all]>=0.6.0,<0.7.0`, Dockerfile multi-stage, compose gerado pela CLI, `ruff` 128 + `mypy` + `pytest asyncio_mode=auto` + testcontainers.

Auth real no `copy/`: só `SessionTransport` ligado em `backend/src/infrastructure/auth/setup.py` (sessions + CSRF + lockout Redis/memory). `BearerTransport` existe na lib (`HS256`, access curto + refresh JWT stateless, `crudauth/constants.py:24`) mas **não** é ligado no boilerplate; não tem rotation/family/Postgres. Hashing da lib: `bcrypt + SHA-256 pre-hash` (`crudauth/utils.py`), não Argon2id. API keys reais são `backend/src/modules/api_keys/` (próprias, `fai_`+scrypt), não da lib. Tenancy/org/membership: zero.

## 2. Reusar (trazer na Fase 1 pós-change)

App factory, Alembic + gate prod + seed, convenções `tests/` + testcontainers, cache decorator + provider Redis/Memcached, rate-limit tier/path + fail-open, Taskiq + brokers, logging estruturado base, `production_validator` + `bp env validate`, Dockerfile multi-stage, `bp deploy generate local/prod/nginx` (decidir versionar vs regenerar).

## 3. Descartar / substituir (ADR 0001)

`crudauth` do dependency tree → auth própria v2 (Argon2id, JWT HS256 `iss/aud/jti/active_org_id`, refresh opaco + `FOR UPDATE`, `tokens_valid_after`, throttling). Sessions/OAuth/API keys/magic/passkeys viram extensões futuras sobre `CurrentPrincipal`, não core.

## 4. Greenfield (não existe no `copy/`)

`modules/identity|organization|tenancy|entitlements`, `core/contracts/{email,storage,payments}`, `core/security/hashing.py`, `module_registry.py` (`CORE_MODULES` + `ENABLED_MODULES`), `TenantScopedRepository` + `SuperuserContext`, `outbox_messages`, `audit_log` append-only, `POST /auth/switch-organization`, testes-guia (reuse-family, concorrência A/B, IDOR completo, webhook unique).

## 5. Riscos

`crudauth` Alpha (`SECURITY.md`: só latest tem fix) — mais um motivo p/ ejetar. `uv.lock` ~590KB versionado — decidir manter. Docs Zensical do upstream — não trazer site, só o necessário. Calibrar Argon2id no hardware-alvo. Sem RLS no v1 (sem decisão PgBouncer agora).
