## Context

Compose local espelha prod nos serviços de dados (design da Fase 8), mas os pins envelheceram: PG16 (EOL 2027-11, uma major atrás) e `redis:7` flutuante (risco 7.4+ source-available). Testes prendem as mesmas imagens em `conftest.py:165-212`. `/client` chegou via PR #1 sem entrypoint make. Windows nativo não roda receitas com bashisms (`SHELL := bash`), então targets novos devem ser de linha única sem `[`/`awk`/`find`.

## Goals / Non-Goals

**Goals:**
- Uma fonte da verdade para pins e comandos docker: vars `?=` do Makefile; composes/conftest consomem com defaults idênticos (fallback quando invocados fora do make).
- Banco via docker como target de primeira classe (`db-up`).
- Frontend rodável via `make web`, funcional até no cmd do Windows.

**Non-Goals:**
- Reescrever receitas existentes para Windows; trocar client Redis; PG18.

## Decisions

1. **PG17, não 18** — 17.11 é o patch estável com EOL até ~2029; 18.6 tem 1 ano de GA e é candidato natural da próxima change dedicada (com matriz CI). Menor risco hoje.
2. **Valkey 9, não Redis 7.2 nem 8** — 7.2 BSD está congelado sem patches (pior p/ segurança); 8 é AGPL (óbice em orgs com política anti-AGPL); Valkey 9.1 é BSD, mantido, RESP-compatível: zero mudança em `app/`. Suite de integração é o gate.
3. **`COMPOSE_ENV` prefixando chamadas compose** — `POSTGRES_IMAGE=$(POSTGRES_IMAGE) REDIS_IMAGE=$(REDIS_IMAGE) $(COMPOSE) …` em `up/tools/db-reset/db-up`; troca de implementação em 1 lugar (ex.: `make up COMPOSE="podman compose"` já funcionava; agora vale p/ imagens).
4. **Healthcheck `valkey-cli`** — imagem Valkey não garante `redis-cli`; `pg_isready` inalterado.
5. **RULE §10 em `docs/RULES.md`** — doc interna PT-BR, sem par bilíngue (regra `RULES §9`): pin `major.minor[-variant]`, nunca major flutuante nem `:latest`; patches flutuam via tag minor; bumps via change.
6. **Docs-only fora do runtime** — `mailpit`/`minio` ficam para a próxima revisão sob a mesma RULE.

## Risks / Trade-offs

- [`RedisContainer` com imagem Valkey] → mitigação: `test-integration` valida; fallback `redis:8-alpine` documentado na tasks.
- [Volume `pgdata` da major 16] → `down -v`/`db-reset` recria; dev sem dados relevantes.
- [`${VAR:-default}` exige compose v2] → repo já usa `docker compose` (plugin v2); `docker-compose` v1 legado não interpola igual — coberto pela var `COMPOSE`.
