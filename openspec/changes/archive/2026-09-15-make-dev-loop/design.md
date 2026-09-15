## Context

Alvos existentes reaproveitados: `_check-env` (falha rápida sem `.env`), `db-up`, `migrate`, `up` (detached `--build`), `web` (foreground, `--strictPort`). Shell `bash` (`SHELL := bash`, Git Bash no Windows).

## Goals / Non-Goals

**Goals:** um comando, falha rápida com mensagem acionável, sem supervisão caseira.
**Non-Goals:** compose p/ o Vite, background de processos locais.

## Decisions

1. **Backend dockerizado + Vite local** — `up` já supervisiona app+worker; Vite local mantém HMR e `WEB_PORT` override. Rejeitado: tudo-local em `&` (jobs órfãos no Windows) e Vite no compose (stage/serviço novos sem ganho).
2. **`migrate` dentro do `dev`** — idempotente; garante schema antes do stack subir. Ordem `db-up → migrate → up` (migrate fala com localhost).
3. **Guard `_check-web-env` + hint de CORS não-fatal** — `client/.env` ausente é erro (exit 1); porta fora do `.env` é só hint (CORS pode vir de `ENV_FILE` alternativo).
4. **Lógica inline (≤5 linhas por receita)** — abaixo do limiar de `scripts/` pela convenção do repo.

## Risks / Trade-offs

- [`up --build` a cada `dev` reconstrói app/worker → lento após mudar Dockerfile; aceito (corretude > velocidade; `db-up`+`api` segue disponível p/ loop quente)] → documentado.
- [Ctrl+C mata só o Vite → `dev-down` explícito + mensagem ao final] → sem armadilha.

## Migration Plan

Sem migração. Rollback = reverter commit.

## Open Questions

- Nenhuma bloqueante.
