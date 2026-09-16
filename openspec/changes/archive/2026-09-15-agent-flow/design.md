## Context

Tipos `Task` disponíveis: `backend-implementer`, `code-reviewer`, `docs-writer`, `explore`, `planner`, `security-auditor`, `tester`. Cada chamada começa com contexto zerado; saída do subagente não é visível ao usuário; skills/agentes aqui são runbooks lidos manualmente (`docs/SKILLS-REGISTRY.md:22`).

## Goals / Non-Goals

**Goals:** delegação repetível e auditável pelo `git log` das changes.
**Non-Goals:** novos agentes ou permissões.

## Decisions

1. **Prompt autossuficiente obrigatório** — paths, critérios de aceite, formato do retorno e comando de verificação. Contexto zerado não é negociável.
2. **Runbook explícito, não implícito** — os 3 de frontend marcados como tal; quem lê sabe que a execução é manual seguindo o `.md`.
3. **Teste com `docs-writer`** (escopo ideal: só docs) em vez de exemplo teórico.
4. **Verificação antes de commit** — retorno de subagente é rascunho até passar nos gates.

## Risks / Trade-offs

- [Subagente abaixo do padrão → corrijo inline e registro no verify] → sem trava.

## Migration Plan

Sem migração. Rollback = reverter commit.

## Open Questions

- Nenhuma bloqueante.
