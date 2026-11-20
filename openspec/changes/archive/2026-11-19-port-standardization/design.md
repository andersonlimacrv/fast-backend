# port-standardization — design

## Context

Vários apps lado a lado na mesma máquina (dono, 2026-10-01). Portas espalhadas
e hardcoded; `E2E_API_PORT=8001` colide com o próximo passo.

## Decisions

1. **Vars explícitas, não slot derivado** (dono): `WEB_PORT`/`API_PORT`/
   `POSTGRES_PORT`/`REDIS_PORT` no `.env`; o par "sempre ligado" é garantido
   pelo `env_check`, não por mágica. Rejeitado: `APP_SLOT` (URLs no `.env`
   continuariam escritas à mão — metade da mágica, todo o risco).
2. **`.env` dirige, tooling lê** — `scripts/env_ports.py` imprime assignments e
   o Make faz `$(eval …)`; compose recebe via `COMPOSE_ENV`; vite lê
   `WEB_PORT` (CLI `--port` continua vencendo). Rejeitado: `-include .env` no
   Make (valores com `#`/quotes/JSON quebram) e `set -a; . .env` nos recipes
   (bash come as aspas internas — ex.: `TRUSTED_HOSTS`).
3. **Interno fixo, host variável** — containers seguem 8000/5432/6379 dentro;
   só o mapa host muda. `Dockerfile`/healthchecks/prod internos intactos.
4. **E2E +500** — 3501/8501/5501/6501 (o 8001 antigo colidia com o dev novo).
5. **Validação, não só documentação** — `env_check` falha se banco/redis/URLs/
   CORS/`client/.env` saírem do par; defaults "tool" evitam warn-noise das
   chaves novas.
6. **CI isolado, mas alinhado** — runners não colidem, mesmo assim segue os
   defaults novos (3001/8001) + `VITE_API_URL` explícito no build (hoje cai no
   fallback do `constants.ts`); snapshots Linux só via workflow próprio.

## Risks / Trade-offs

- `$(eval $(shell uv run …))` roda a cada invocação do Make (~1 `uv run`);
  aceitável; alternativa seria duplicar defaults (drift). Mitigado: uma única
  chamada imprime as 4 vars.
- Containers existentes serão recriados com os novos mapas (volumes OK);
  `migrate` exige `db-up` primeiro no novo 5401.
- Footer do shell exibe `VITE_API_URL`: mudar o build muda snapshots Linux →
  regenerar via `web-e2e-baselines.yml` (regra do repo).
