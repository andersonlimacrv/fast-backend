# ADR 0010 — Remoção de `references/Makefile` (override explícito do congelado)

- Status: aceito (override do operador em 2026-09-15; ato único, `references/` volta a ser intocável)
- Data: 2026-09-15
- Exceção registrada contra: `AGENTS.md` e `docs/RULES.md` ("`references/` nunca editar")

## Contexto

`references/Makefile` é um Makefile genérico upstream (`PROJECT_NAME=bootloader-manager-app`, fluxo `poetry`, sem `help-first`, sem guards, sem `.PHONY` completo). O `Makefile` raiz do repo é reescrita própria sob a skill `makefile-keeper` (help-first, fork points `?=`, guards `_check-*`, docs sync em `docs/Makefile*.md`).

## Decisão (override do operador)

Remover `references/Makefile` via `git rm`, com este registro como justificativa auditável.

## Prova de não-cópia literal

| Alvo | `references/Makefile` | `Makefile` raiz |
|---|---|---|
| `up/down/logs/restart` | `docker compose` direto, sem build/checks | com `--build`, `_check-env`, perfis |
| `migrate/*` | via `poetry run` dentro do container | `uv run alembic` local |
| `help` | inexistente | índice `awk` + `help-unclassified` como gate |
| `dev/dev-down/db-up/web-*` | inexistentes | loop dev completo (change `make-dev-loop`) |
| Segurança | nenhuma menção | `CONFIRM=1`, sem segredos, `gitleaks` |

Incorporação apenas conceitual (a ideia de "alvos curtos p/ compose/db/migrate"); zero linhas copiadas.

## Consequências

- `git log` preserva o conteúdo para sempre (remoção ≠ perda de proveniência).
- `references/` volta a valer como congelado; nova exceção exige nova ADR.
- Reversão: `git revert` deste commit (nunca editar esta ADR).
