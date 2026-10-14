# port-standardization — tasks

## S0 — Change + norma

- [x] 0.1 `openspec/changes/port-standardization/{proposal,tasks,design}.md`
- [x] 0.2 `docs/RULES.md` §13 "Portas por app" (norma permanente) + aprovação do plano

## S1 — Env + validação

- [x] 1.1 `.env.example`: seção de portas (`WEB_PORT=3001`, `API_PORT=8001`, `POSTGRES_PORT=5401`, `REDIS_PORT=6401`) + URLs/CORS/FRONTEND_URL derivadas
- [x] 1.2 `.env` local espelhado (não commitado)
- [x] 1.3 `scripts/env_ports.py`: lê `.env` (+ fallback `.env.example`) + `--make` pulando overrides do ambiente
- [x] 1.4 `scripts/env_check.py`: defaults "tool" das 4 vars + consistência (banco/redis/URLs/CORS × portas × `client/.env`)
- [x] 1.5 `test_env_check.py` + `test_env_ports.py`: casos das novas regras

## S2 — Makefile

- [x] 2.1 `API_PORT ?= 8001` substitui `PORT`; `WEB_PORT ?= 3001`; `E2E_WEB_PORT ?= 3501`, `E2E_API_PORT ?= 8501`, `E2E_PG_PORT ?= 5501`, `E2E_REDIS_PORT ?= 6501`
- [x] 2.2 Leitura do `.env` via `$(eval $(shell …env_ports.py --make))` + `COMPOSE_ENV` repassa; hints/mensagens atualizados
- [x] 2.3 `docs/Makefile.md` (+pt): tabela de vars + seção do esquema por app

## S3 — Compose

- [x] 3.1 `docker-compose.yml`: db/redis/app/tools com `${VAR:-default}`; e2e defaults novos
- [x] 3.2 `docker-compose.prod.yml`: `app` com `${API_PORT:-8001}:8000`

## S4 — Client

- [x] 4.1 `vite.config.ts`: `server`/`preview` por `WEB_PORT` (default 3001, strictPort)
- [x] 4.2 `client/.env(.example)` `VITE_API_URL=http://localhost:8001`; fallback de `constants.ts` → 8001
- [x] 4.3 `playwright.config.ts` `WEB_PORT ?? "3001"`; `e2e/helpers.ts` default 8001

## S5 — Scripts

- [x] 5.1 `e2e_spa_flow.py` defaults 8001/3001
- [x] 5.2 `new_project.py --slot N` grava as 4 portas + URLs no projeto novo

## S6 — CI/deploy/docs

- [x] 6.1 `ci.yml` web + `web-e2e-baselines.yml`: CORS/FRONTEND_URL 3001, uvicorn 8001, `VITE_API_URL` no build
- [x] 6.2 `deploy.yml` (healthcheck lê `API_PORT` do `.env` do VPS) + `DEPLOYMENT.md` (+pt): Caddy com `${API_PORT}`
- [x] 6.3 README, client/README, CHANGELOG

## S7 — Verificação

- [x] 7.1 `make env-check`, unit (env_check), `ruff` nos scripts
- [x] 7.2 `tsc -b`/vitest/build do client
- [x] 7.3 Smoke `make dev`: 3001/8001/5401/6401 + `/healthz` + CORS real
- [x] 7.4 `make e2e-full` nas portas novas (3501/8501/5501/6501)
- [ ] 7.5 Sem commit sem pedido
