# port-standardization — proposal

## Why

Vários apps vão rodar lado a lado nesta máquina (dono, 2026-10-01). Hoje as portas
estão espalhadas e parcialmente hardcoded (5173/8000/5432/6379) e o bloco E2E
(`E2E_API_PORT=8001`) colide com o próximo passo. Sem padrão, cada app novo
vira caça a conflito.

## What Changes

Convenção **app N** (este app = N=1): front `3000+N`, back `8000+N`, Postgres
`5400+N`, Redis `6400+N`; E2E isolado `+500` (3501/8501/5501/6501). Fonte da
verdade: 4 vars explícitas no `.env` (`WEB_PORT=3001`, `API_PORT=8001`,
`POSTGRES_PORT=5401`, `REDIS_PORT=6401`) — o tooling lê do `.env`, nunca o
contrário. Portas internas dos containers ficam fixas.

- **S0**: change + `docs/RULES.md` §13 (norma permanente).
- **S1**: `.env(.example)` + `scripts/env_ports.py` + `env_check` com defaults
  "tool" e checagem de consistência (banco/redis/URLs/CORS × portas ×
  `client/.env`) + casos em `test_env_check.py`.
- **S2**: Makefile (`API_PORT` substitui `PORT`; `WEB_PORT=3001`; `E2E_*` novo
  bloco; leitura do `.env` via `$(eval …)`; `COMPOSE_ENV` repassa) +
  `docs/Makefile.md` (+pt).
- **S3**: compose dev/prod com `${VAR:-default}` (db/redis/app/tools); e2e
  defaults novos. `Dockerfile`/healthchecks intactos (porta interna fixa).
- **S4**: client — `vite.config.ts` (`server`/`preview` por `WEB_PORT`,
  default 3001, strictPort), `VITE_API_URL=8001` em `client/.env(.example)` +
  fallback do `constants.ts`, Playwright `WEB_PORT ?? 3001`,
  `e2e/helpers.ts` default 8001.
- **S5**: `e2e_spa_flow.py` 8001/3001; `new_project.py --slot N`.
- **S6**: CI web jobs → 3001/8001 (+`VITE_API_URL` no build); `deploy.yml`/Caddy
  em `DEPLOYMENT.md` (+pt) com `${API_PORT}`; README/client-README; CHANGELOG.
- **S7**: `make env-check`, unit (env_check), `tsc -b`/vitest/build, smoke
  `make dev` (3001/8001/5401/6401), `make e2e-full` nas portas novas.
  Baselines Linux só via workflow próprio.

## Capabilities

### New Capabilities

- Nenhuma (infra/tooling).

### Modified Capabilities

- `dev-loop`: portas por app via `.env` (+ helper `env_ports.py`).
- `env-validation`: consistência de portas passa a ser checada.
- `e2e-isolated-db`: novo bloco de portas E2E.

## Impact

- Alterados: `.env(.example)`, `Makefile`, composes, `Dockerfile` (não),
  `client/*` (vite, constants, playwright, helpers, `.env`), scripts,
  workflows CI, docs, CHANGELOG.
- `.env` local é atualizado junto (não commitado).
- Containers existentes serão recriados com os novos mapas (volumes persistem;
  `make migrate` após `make db-up`).

## Non-goals

Migrar dados; mudar portas internas dos containers; tocar em código de
negócio (`app/` só no exemplo de erro do `settings.py`).

## Acceptance criteria

1. `.env` dirige tudo: `make api` sobe em 8001, `make dev`/`web` em 3001, compose
   mapeia 5401/6401/8001 sem edição manual.
2. `make env-check` falha se qualquer URL/CORS sair do par do app.
3. `make e2e-full` verde nas portas novas; CI web verde; docs sincronizadas.
