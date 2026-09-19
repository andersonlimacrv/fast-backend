## Context

`Settings(env_file=".env")` (`app/core/settings.py:13`) + `base_settings` parcial (`app/tests/conftest.py:258-264`, só `secret_key/database_url/redis_url/login_max_attempts` explícitos; `frontend_url` via `setdefault` em `:33`) + `env-check` que aceita extras (`scripts/env_check.py:142-143`, `test_env_check.py:71-76`). Resultado: `.env` customizado válido quebra testes que assumem defaults (ex. `password_reset_ttl_minutes==60` em `test_settings_validation.py:93`, `BILLING_ENABLED=true` sem `STRIPE_WEBHOOK_SECRET` falha em `settings.py:111-112`).

## Goals / Non-Goals

Goals: suite hermética por padrão, allowlist mínima, fail-fast intacto. Non-goals: mudar validadores, runtime, imagens, criar `.env.test`.

## Decisions

1. **Clear env com allowlist, não `setdefault` global** — remove `conftest.py:33`; cada `Settings` de teste recebe `frontend_url` explícito. Rejeitado: manter `setdefault` (mascara o fail-fast e perde para env exportado).
2. **Allowlist: `POSTGRES_IMAGE`/`REDIS_IMAGE`/`DOCKER_BIN`/`FB_TEST_NETWORK`/`TESTCONTAINERS_*`/`DOCKER_*`/`CI` (+ `PATH` and co. do SO)** — fonte única Makefile (`RULES.md §10`); resto limpo. Rejeitado: limpar tudo (quebra Testcontainers e detecção `HOST_NET` em `:39-47`, Ryuk NT em `:43-47`).
3. **Sem dotenv do repo** — `_env_file=None` por instância ou `chdir tmp_path` (padrão já usado em `test_settings_validation.py:25,41,61`); spike em tasks 2.1 decide. Rejeitado: `env_file=.env.test` (arquivo novo = drift).

## Risks / Trade-offs

- Fixtures que dependem de env real (`containers:187-254`, `test_amain:66-73`, minio/mailpit lendo `DOCKER_BIN`) → allowlist + matriz com/sem `.env` no aceite.
- Leitura de env no import (`HOST_NET:39`, `POSTGRES_IMAGE:52-54`) roda antes da fixture → documentar que `POSTGRES_IMAGE=x pytest` continua valendo; fixture não retroage import.
- `get_settings` com `lru_cache` (`settings.py:135-137`) fora de testes → grep de regressão garantindo que `build_app(settings)` (`conftest.py:288-289`) nunca chama o cache sem argumento.

## Migration Plan

Só testes; rollback = revert. Sem migração Alembic.

## Open Questions

- `_env_file=None` cobre `os.environ` sujo ou precisa dos dois (clear + no-dotenv)? Spike responde antes do 3.1.
