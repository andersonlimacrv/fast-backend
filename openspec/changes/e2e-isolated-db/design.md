# e2e-isolated-db — design

## Topologia (ports fixos p/ conviver com o dev ligado)

| Papel | Dev (intocado) | E2E (novo) |
|---|---|---|
| Postgres | 5432 / `pgdata` | `E2E_PG_PORT?=5434` / `pgdata_e2e` |
| Redis | 6379 | `E2E_REDIS_PORT?=6380` |
| API | 8000 (`PORT`) | `E2E_API_PORT?=8001` (uvicorn local, env override) |
| Preview | `WEB_PORT?=5173` | `E2E_WEB_PORT?=5174` |

## Fluxo `make e2e`

`e2e-db-up` → wait healthy → `e2e-migrate` (`DATABASE_URL` e2e) → `e2e-build`
(`VITE_API_URL=http://127.0.0.1:8001`) → `e2e-api` bg (pid em `var/`,
`trap` mata no fim; `CORS_ORIGINS` inclui 5174) → `E2E_API_URL`+`WEB_PORT`
no Playwright → teardown (kill API, `stop` e2e; volumes ficam; `e2e-clean`
purga com `rm -f -v`).

## Decisões

- API e2e local (uvicorn), não container: reaproveita `make api`, sem build
  de imagem; dados em containers (hermético onde importa).
- Volumes e2e persistentes por padrão (runs rápidos); purge explícito.
- `web-e2e` preservado como legado documentado (não quebrar hábito de uma vez).
- Sem `.env` novo: tudo via vars `?=` + env do target (RULES §10).

## Alternativas consideradas

- Segundo database no mesmo Postgres dev: rejeitado — `down -v` do dev
  levaria os dados e2e junto e vice-versa; purge arriscado.
- Cleanup `afterAll` por spec: rejeitado — frágil, não protege de DELETEs.
