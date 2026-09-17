# e2e-isolated-db — tasks

## S0 — Change (esta change)

- [x] 0.1 `openspec/changes/e2e-isolated-db/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Compose + Makefile (eu)

- [x] 1.1 `db-e2e`/`redis-e2e` no compose (vars `E2E_PG_PORT`/`E2E_REDIS_PORT`, volumes próprios, healthcheck; `STACK_SERVICES` intacto)
- [x] 1.2 Targets `e2e-db-up/down/clean`, `e2e-migrate`, `e2e-api` (bg + trap), `e2e-build`, `e2e-stop`, `e2e-full` (orquestra + teardown); `web-e2e` documentado como legado
- [x] 1.3 `CORS_ORIGINS` da API e2e p/ `E2E_WEB_PORT`; skip-text dos helpers aponta `make e2e-full`; `COMPOSE_ENV` exporta `E2E_*` (RULES §10)

## S2 — Docs + verificação (eu)

- Nota: `E2E_PG_PORT` padrão é 5434 porque 5433 já é um `postgres.exe` nativo
  nesta máquina (handshake morria no meio); `E2E_*` continuam `?=` p/ override.
- [x] 2.1 Linhas na `docs/Makefile.md` + pt-BR
- [x] 2.2 **APRESENTAR ao dono ANTES de fechar** (ordem permanente)
- [x] 2.3 Gates: `make e2e-full` 16/16 (2 runs); dev `users` 661→661; `e2e-clean` ok; backend 159 + vitest + `ruff`/`mypy`/`oxlint` verdes
- [ ] 2.4 Sem commit sem pedido

## Notas de implementação (divergências do plano, com motivo)

- Receita `e2e-full` é **uma única invocação shell** (`set -e` + `trap` primeiro): em linhas separadas o `trap` nunca armava e falha no meio pulava o teardown.
- `e2e-stop` tenta `kill` + `taskkill //F //T` (órfãos do wrapper `uv run` no Windows).
- `npm --prefix` **antes** do `run` (depois vai parar no script Playwright, não no npm).
- Nome final `e2e-full` (não `e2e`): `e2e` já existe (script SPA backend).
- 1 transient em 4 runs e2e (landing 4%, causa não isolada — monitorar).
