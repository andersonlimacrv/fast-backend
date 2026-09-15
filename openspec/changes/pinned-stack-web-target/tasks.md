## 1. Change (este diretório)

- [x] 1.1 `proposal.md` + `design.md` + `specs/deployment/spec.md` (delta MODIFIED)
- [x] 1.2 Aprovação do usuário ( Lovable: "pode executar" em 2026-09-15)

## 2. Pins (fonte única = Makefile)

- [x] 2.1 `Makefile`: vars `POSTGRES_IMAGE ?= postgres:17-alpine`, `REDIS_IMAGE ?= valkey/valkey:9-alpine`, `DOCKER ?= docker`, `NPM ?= npm`, `CLIENT_DIR ?= client`, `WEB_PORT ?= 5173`, `COMPOSE_ENV`
- [x] 2.2 `docker-compose.yml` + `docker-compose.prod.yml`: `image: ${POSTGRES_IMAGE:-...}` / `${REDIS_IMAGE:-...}`; healthcheck `valkey-cli`; prod `valkey-server --appendonly yes`
- [x] 2.3 `app/tests/conftest.py`: `os.getenv("POSTGRES_IMAGE"/"REDIS_IMAGE"/"DOCKER_BIN")` com os mesmos defaults
- [x] 2.4 `docs/RULES.md §10`: pin de versões

## 3. Targets

- [x] 3.1 `db-up` (Docker, `_check-env`, `up -d $(STACK_SERVICES)`) + `.PHONY`
- [x] 3.2 `web-install` + `web` (Run, shell-agnostic) + `.PHONY`
- [x] 3.3 Prefixar `COMPOSE_ENV` em `up/tools/db-reset/db-up` (+ `DOCKER_BIN`/images em `test-integration`)

## 4. Docs bilíngues

- [x] 4.1 `docs/Makefile.md` + `docs/Makefile.pt-BR.md` (vars + 3 targets)
- [x] 4.2 `README.md` + `README.pt-BR.md` (bloco Frontend dev)

## 5. Verificação

- [x] 5.1 `grep` sem `16-alpine`/`redis:7-alpine`/`redis-cli`/`redis-server` nos 3 arquivos-fonte
- [x] 5.2 `make db-up` (via Git Bash) → `db`+`redis` healthy (PG17 accepting connections, Valkey PONG)
- [x] 5.3 Infra/frontend: `compose config` local+prod resolve pins; `make web-install` (npm ci, 0 vuln); Vite `:5173` → HTTP 200
- [ ] 5.4 `make test-integration` verde — BLOQUEADO: `uv` ausente no PATH e `.env` vazio (ações do usuário)
- [x] 5.5 `git status --short` só previstos (`node_modules` gitignored); sem segredo
