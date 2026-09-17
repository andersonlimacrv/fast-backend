## Why

Testes que assumem ausência de chaves quebram quando o `.env` do dev tem customizações válidas para o `env-check` (chave extra não falha — `env_check.py:142-143`). Causa raiz: `Settings` lê o `.env` do cwd (`app/core/settings.py:13`, `env_file=".env"`, prioridade init > os.environ > dotenv > defaults) e o `conftest` só pinou `FRONTEND_URL` via `setdefault` (`app/tests/conftest.py:30-33`), que nem isola (perde para valor já exportado) nem cobre as demais chaves (`TENANCY_MODE`, `TRUSTED_HOSTS`, `CORS_ORIGINS`, `BILLING_ENABLED`, `ARGON2_*`, etc. vazam do `.env` do dev via `base_settings` parcial em `:258-264`). É o item 2 do Futuro registrado (`docs/ROADMAP.md`).

## What Changes

- Fixture `autouse` hermética no `conftest`: salva allowlist (`POSTGRES_IMAGE`, `REDIS_IMAGE`, `DOCKER_BIN`, `FB_TEST_NETWORK`, `TESTCONTAINERS_*`, `DOCKER_*`, `CI`, `PATH` and co.), limpa o resto do env e impede leitura do dotenv do repo (spike: `_env_file=None` por instância vs `chdir tmp_path` — padrão já usado em `test_settings_validation.py:25,41,61`).
- `base_settings` passa `frontend_url` explícito; remove o `setdefault` global (que mascarava o fail-fast).
- Adapta os testes sensíveis mapeados no design (unit com `Settings(secret_key=...)` nu, integration com overrides parciais, CLI/bootstrap).
- `POSTGRES_IMAGE`/`REDIS_IMAGE` via env continuam fluindo (fonte única `RULES.md §10`); fail-fast de `FRONTEND_URL` (`settings.py:119-120`) preservado — só explícito na fixture, nunca global.

## Capabilities

### New Capabilities

- Nenhuma (higiene de suite).

### Modified Capabilities

- Nenhuma capability de produto; gates de suite.

## Impact

- Alterado: `app/tests/conftest.py` + testes sensíveis listados no design.
- Intactos: runtime (`app/main.py`, `app/worker.py`, `app/migrations/env.py`, `scripts/*`), validadores de `Settings`, pins de imagem.

## Non-goals

RLS, mudança em `Settings`, `env_file=.env.test` novo (drift), E2E do `client/`.

## Acceptance criteria

1. `pytest -m unit` e `-m integration` verdes na matriz: sem `.env` / `.env.example` copiado / `.env` com customs (`TENANCY_MODE=row`, `BILLING_ENABLED=true`, `TRUSTED_HOSTS`/`CORS`/`ARGON2`/TTL customs).
2. `ruff check`, `ruff format --check`, `mypy` verdes.
3. Fail-fast `FRONTEND_URL` continua falhando sem valor; Testcontainers respeita `POSTGRES_IMAGE`/`REDIS_IMAGE` do env.
