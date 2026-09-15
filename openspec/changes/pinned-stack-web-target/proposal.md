## Why

Três dívidas convergem: (1) `redis:7-alpine` é tag flutuante que pode resolver para 7.4+ (RSALv2/SSPLv1, não-OSI) e `postgres:16-alpine` está uma major atrás — fim de 2026, PG 18.6 é o current e 17.11 o patch estável, PG14 morre em 11/2026; (2) pins espalhados em 3 lugares (`docker-compose.yml`, `docker-compose.prod.yml`, `app/tests/conftest.py`) sem fonte única; (3) frontend `/client` (PR #1) não tem entrypoint no `Makefile`, que é o ponto único de entrada do repo. Decisão do usuário: pinar tudo por segurança e transformar em RULE; PG17 + Valkey 9 (BSD, protocolo-compatível) como stack.

## What Changes

- Imagens: `postgres:16-alpine` → `postgres:17-alpine`; `redis:7-alpine` → `valkey/valkey:9-alpine` (BSD, mantido; 9.1 estável em 05/2026). Healthcheck do serviço `redis` migra `redis-cli` → `valkey-cli`.
- Fonte única: `Makefile` ganha `POSTGRES_IMAGE ?=`, `REDIS_IMAGE ?=`, `DOCKER ?=`, `COMPOSE` (já existia); composes usam interpolação `${VAR:-default}`; `conftest.py` lê `os.getenv` com os mesmos defaults. Muda-se em 1 lugar.
- Novos targets: `db-up` (sobe só `db`+`redis` — banco via docker como cidadão de primeira classe), `web-install` + `web` (frontend dev, shell-agnostic para funcionar até no cmd).
- `docs/RULES.md §10`: pin de versões (nunca tag flutuante major nem `:latest`).
- Docs em par bilíngue: `docs/Makefile*.md` + bloco Frontend nos `README*.md`.
- Zero mudança em `app/` (só `app/tests/conftest.py`, imagens dos fixtures).

## Capabilities

### New Capabilities

- (vazio — reuso de `deployment` + `guides-docs`)

### Modified Capabilities

- `deployment`: pins PG17/Valkey 9 centralizados em vars do Makefile; paridade dev/prod/teste.

## Impact

- Arquivos: 2 composes, `conftest.py`, `Makefile`, `docs/RULES.md`, `docs/Makefile*.md`, `README*.md`.
- Volume `pgdata` existente (major 16→17) exige recriação local (`compose down -v` / `make db-reset CONFIRM=1`); sem dados relevantes em dev.
- `RedisContainer` do testcontainers passa a subir imagem Valkey (protocolo RESP idêntico); suite de integração valida.
- Comportamento da API inalterado; scheme `redis://` das URLs mantido (só o servidor troca).

## Non-goals (v2 §21)

- Migrar client `redis-py`/`taskiq-redis` para GLIDE; pinar mailpit/minio (revisão seguinte, mesma RULE); PG18; RLS; mudar `TENANCY_MODE`.

## Acceptance criteria

1. `grep -rn "16-alpine\|redis:7-alpine" docker-compose*.yml app/tests/conftest.py` retorna vazio.
2. `make db-up` sobe `db`+`redis` healthy; `make web-install` + `make web` sobem a SPA em `:5173`.
3. `make test-integration` verde contra PG17 + Valkey 9.
4. `git status --short` só com os arquivos previstos; sem segredo.
