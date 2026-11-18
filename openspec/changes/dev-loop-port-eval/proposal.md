# dev-loop-port-eval — proposal

## Why

Depois da troca Windows → Linux, `make dev` falha em dois pontos distintos:

1. **`vite: comando não encontrado` (exit 127).** `client/package.json:7`
   define `dev: vite` e `vite` está em `devDependencies`
   (`client/package.json:50`). Sem `client/node_modules`, `npm run dev` não
   encontra o binário. `Makefile:172-177` não instala nem valida as deps do
   client; `web-install` (`Makefile:210-211`) existe, mas não é pré-requisito
   e nem é sugerido pelo erro.
2. **`WEB_PORT` poluída (`3001;API_PORT=8001;...`).** `scripts/env_ports.py:85`
   emite assignments separados por `;`, e o comentário `:77-79` afirma que `;`
   separa statements dentro de `$(eval)`. Isso é falso no GNU Make 4.4.1:
   `$(eval WEB_PORT=3001;API_PORT=8001;)` deixa `WEB_PORT` com o valor
   `3001;API_PORT=8001;` e não define `API_PORT`. `Makefile:28-29` faz
   exatamente `ENV_PORTS := $(shell ...)` + `$(eval $(ENV_PORTS))`, então o SPA,
   o hint de CORS (`Makefile:173-174`) e o `--port` herdam o lixo.

O bug 2 ficou escondido no Windows porque o `$(shell uv run ...)` falhava e o
fallback silencioso (`Makefile:25-27`) caía nos defaults `?=`; no Linux o
helper funciona e a poluição aparece.

## What Changes

- **Makefile:** trocar `$(eval $(ENV_PORTS))` por um split explícito em `;`
  (`$(foreach ... $(eval ...))`), preservando o fallback silencioso, a
  precedência de CLI/env e os `?=`.
- **`scripts/env_ports.py`:** corrigir o comentário que descreve o contrato
  (`;` é o delimitador de transporte; quem separa os assignments é o Makefile).
- **Makefile:** novo pré-requisito `_check-web-deps` com mensagem acionável
  (`run 'make web-install' first`) em `dev` e nos targets web que dependem de
  `node_modules`; nunca auto-instalar.
- **Teste de regressão:** unit test que roda `make -n dev` com um `.env` hermético
  e asserta que o `--port` é o valor limpo; skip quando não há `make`/`bash`.
- **Docs:** `docs/Makefile.md` (+pt-BR) e `CHANGELOG.md`.

## Capabilities

- `dev-loop`: portas lidas do `.env` passam a chegar limpas ao Make; deps do
  client ausentes falham com instrução, não com 127.

## Impact

- `Makefile`, `scripts/env_ports.py`, `app/tests/unit/test_env_ports.py`,
  `docs/Makefile.md`/`.pt-BR.md`, `CHANGELOG.md`. Sem tocar runtime (`app/`).

## Non-goals

- Auto-`npm ci` no `make dev` (instalação surpresa/lenta).
- Mudar a convenção de portas (`RULES.md` §13).
- Alterar o formato público do helper fora do contrato `--make`.

## Acceptance criteria

1. `make -n dev` mostra `--port 3001 --strictPort` (sem `;API_PORT=...`) e o
   hint de CORS com a porta limpa.
2. `make _check-web-deps CLIENT_DIR=/tmp/inexistente` falha com a mensagem
   `run 'make web-install' first`; com `node_modules` presente, passa.
3. `make env-check`, `uv run pytest -m unit` (incluindo o novo teste) e
   `ruff` verdes; `make help`/`help-unclassified` sem regressão.
4. Nenhuma mudança de comportamento em runtime ou em portas configuradas.
