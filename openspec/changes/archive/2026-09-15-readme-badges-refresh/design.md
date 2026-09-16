## Context

Precedent: `oss-professional` decided generic tests badge (counts age; numbers live in CHANGELOG/CI). shields.io static + `?logo=` simple-icons slugs. Delegation recipe from `agent-flow` (AGENTS.md §4 item 6).

## Goals / Non-Goals

**Goals:** professional vitrine, zero aging numbers, proven links.
**Non-Goals:** new docs sections beyond pointer/structure; version badges.

## Decisions

1. **`docs-writer` via `Task` owns prose** (first exercise per `agent-flow` 2.1); I own URL verification + conventions + gates.
2. **HEAD-check every badge URL** (ephemeral python, not committed) — a dead badge is worse than none.
3. **Counts only where self-updating**: CI badge (dynamic), everything else static labels.
4. **Structure from disk**, not memory (`app/modules`, `app/interfaces`, migrations range, `scripts/*.py`, spec count).

## Risks / Trade-offs

- [shields.io downtime in CI? badges are client-side images, no gate depends on them] → none.
- [Subagent below standard → fix inline, record in verify] → per agent-flow.

## Migration Plan

Docs only. Rollback = revert commit.

## Open Questions

- Nenhuma bloqueante.
