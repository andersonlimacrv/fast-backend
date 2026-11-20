# references-cleanup — proposal

## Why

Owner deleted `references/implementation_v2.md` and
`references/components_to_use/` (2026-10-13, owner's hands — the freeze bound
the agent, not the owner) after approving the `v2-coverage-audit` disposition
table (no confirmed gaps; §2.3 decided as flags-as-registry). ~20 live
pointers now dangle: hierarchy lines, agent runbooks, `openspec/config.yaml`,
catalog comments. This change sweeps them to their new homes.

## What Changes

- `AGENTS.md`: context line (frozen reference gone → audit trail pointer),
  hierarchy (drop `references/*`), map (drop the file entry).
- `docs/RULES.md`: hierarchy + "única referência congelada" + "nunca editar
  `references/`" lines rewritten (principle survives as: frozen rationale now
  lives in the audit table + ADRs; `copy/*` stays read-only evidence).
- `docs/ROADMAP.md`: alignment line + frozen-checkbox line.
- `openspec/config.yaml`: Frozen line (drop the file; keep the decisions) +
  proposal rules (cite audit table + ADR instead of v2 section).
- 6 runbooks (`planner`, `backend-implementer`, `code-reviewer`, `tester`,
  `security-auditor`, `docs-writer`): v2 section pointers → audit table +
  RULES/ADR sections.
- `client/src/lib/catalog/{entries,types}.ts` comments: seed-origin notes →
  historical (26 entries, all validated; ref strings kept).
- `docs/review-design.md`: deletion note on top (body untouched — history).
- `CHANGELOG.md`: record of the removal + where the content lives now.
- ADRs (0001–0009) and archived changes: NOT rewritten (historical record);
  resolved via the `v2-coverage-audit` §5 citation map, linked from here.

## Non-goals

Rewriting history (ADRs/archives); deciding the Phase 4 inbox rule (separate
owner one-liner, recorded afterwards); any code behavior change.

## Acceptance criteria

1. No live (non-historical) file references a path under `references/`.
2. Every rewritten pointer resolves to an existing doc/section.
3. Gates: `git status` shows only intended files; no commit without request.
