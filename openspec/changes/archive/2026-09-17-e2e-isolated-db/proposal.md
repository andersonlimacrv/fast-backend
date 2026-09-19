## Why

O e2e do client registra usuários/orgs reais contra a API de dev (mesmo
`fastbackend` do compose, sem limpeza): ~600 `e2e-*` no banco dev, suíte
order-dependent e risco real de um `DELETE` futuro atingir dados do dono.
O backend já é isolado (Testcontainers); falta o par client→API.

## What Changes

- Compose: `db-e2e` (`${POSTGRES_IMAGE}`, host `E2E_PG_PORT?=5433`, volume
  `pgdata_e2e`) + `redis-e2e` (`${REDIS_IMAGE}`, `E2E_REDIS_PORT?=6380`), com
  healthcheck; `STACK_SERVICES` (dev) intocado.
- Makefile: vars `E2E_API_PORT?=8001`, `E2E_WEB_PORT?=5174` (+ acima) e targets
  `e2e-db-up/down/clean`, `e2e-migrate`, `e2e-api` (bg), `e2e-build`
  (`VITE_API_URL` p/ 8001), `e2e` (orquestra tudo + teardown); `web-e2e` vira
  legado documentado (vs API dev — polui).
- API e2e com `CORS_ORIGINS` p/ 5174 (sem isso o SPA falha fechado, status 0).
- Helpers e2e intactos (`E2E_API_URL`/`WEB_PORT` já parametrizados); texto do
  skip aponta p/ `make e2e`. Docs `Makefile.md` + pt-BR.

## Capabilities

### New Capabilities

- `e2e-isolated-stack`: banco/redis/API/preview dedicados e descartáveis.

## Impact

- `docker-compose.yml`, `Makefile`, `docs/Makefile*.md`, 1 linha de helpers.
  Zero `app/`; zero URLs de prod; volumes dev (`pgdata`) nunca tocados.

## Non-goals

- Mudar `web-e2e` por baixo (só documentado como legado); RLS; segundo
  worker/mailpit no e2e; commit sem pedido.

## Acceptance criteria

1. `make e2e` verde de ponta a ponta com o stack dev **desligado**.
2. `SELECT count(*) FROM users` no dev inalterado após o run.
3. `make e2e-clean` remove os dados e2e; rerun limpo passa.
4. Sem `TRUSTED_HOSTS`/CORS novo em prod (só dev/CI local).
