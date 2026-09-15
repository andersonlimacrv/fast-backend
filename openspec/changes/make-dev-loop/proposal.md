## Why

Não há comando único p/ o loop dev full-stack: hoje são 2–3 terminais (`db-up` → `migrate` → `api`/`worker` → `web`). Um `make dev` reduz o onboarding a um comando e elimina a falha silenciosa clássica (CORS sem a origem do Vite).

## What Changes

- **`make dev`**: `_check-env` + `_check-web-env` (novo guard: `client/.env` existe) → `db-up` → `migrate` → `up` (stack detached) → dica de CORS se `$(WEB_PORT)` fora do `.env` → `web` em foreground (Ctrl+C sai do Vite; stack segue no ar).
- **`make dev-down`**: `$(COMPOSE) down` (para a stack, mantém volumes).
- Docs sync (skill `makefile-keeper`): `docs/Makefile.md` + `.pt-BR.md`; `.PHONY`; `help` continua classificado.

## Capabilities

### New Capabilities

- `dev-loop`: um comando p/ backend dockerizado + frontend com guards e hints.

### Modified Capabilities

- Nenhuma (só Makefile + docs; nenhum runtime muda).

## Impact

- Só `Makefile`, `docs/Makefile*.md`, change OpenSpec. Sem imagem nova, sem serviço novo, sem dependência nova.
- `migrate` roda sempre (idempotente, `alembic upgrade head`).

## Non-goals (v2 §21)

Frontend no compose; `api`+`worker` locais em background (frágil no Windows — compose já supervisiona); auto-`npm ci`.

## Acceptance criteria

1. `make help` lista `dev`/`dev-down`; `make help-unclassified` vazio.
2. Sem `client/.env`: `make dev` falha em <5s nomeando o arquivo.
3. Com tudo pronto: :8000 `/healthz` ok + :5173 SPA servindo contra a API; `make dev-down` derruba sem órfãos.
