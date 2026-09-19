## Context

Bootstrap entregue em `2026-09-15-A-admin-control-plane` (ADR 0005, spec `admin`): CLI one-shot, `BOOTSTRAP_KEY` com `compare_digest`, `getpass`, falha-fechada genérica, auditado. Docs existentes: runbook VPS (`DEPLOYMENT.md:21-29`), seção admin do `client/README.md:42-56`, docstring do script, `.env.example:78-80`. Falta a camada "primeiro uso em dev".

## Goals / Non-Goals

Goals: dev novo chega ao root logado só com o documentado; `bootstrap failed` vira checklist acionável sem vazar causas. Non-goals: qualquer runtime, validação de email (change própria), `.env.example` com `ROOT_EMAIL`.

## Decisions

1. **Checklist de entradas, nunca de causas** — listar regras (key ≥32 no env-check, migrations até 0008, email válido, senha ≥8, TTY p/ getpass) preserva o fail-closed: diz o que conferir, nunca qual checagem falhou. Rejeitado: códigos de erro distintos (vira oráculo key-vs-exists).
2. **`ROOT_EMAIL` fora do `.env.example`** — `check_env` itera `set(example)|set(env)` e marca ausente-no-env como drift; exemplo mínimo evita quebrar clones. O help + runbook cobrem a descoberta. Rejeitado: adicionar ao example (drift em massa).
3. **Pointer curto no README, detalhe no DEPLOYMENT** — README não vira runbook; uma seção canônica evita drift duplo (anti-drift `RULES.md §10`).
4. **Nota `getpass`/Windows honesta** — MINGW64 normalmente entrega TTY ao `getpass`, mas sem TTY ele falha fechado; documentado como item de checklist, não como bug.

## Risks / Trade-offs

- [Email sem `@` ainda passa no código até a change 2] → checklist já exige email válido; change `bootstrap-email-validation` fecha no código.
