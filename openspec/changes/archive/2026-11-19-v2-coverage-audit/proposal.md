# v2-coverage-audit — proposal

## Why

Owner decision (2026-10-13): `references/implementation_v2.md` will be deleted
(owner's hands — the freeze binds the agent, not the owner) and
`references/components_to_use/` (porting queue at zero: 23/23 docs consumed,
26 catalog entries, all `validated`) goes with it. Deletion is only safe after
every v2 section is accounted for — otherwise the ADR evidence chain
(0001–0009 cite "v2 §X") and ~20 live pointers (AGENTS.md, RULES.md, ROADMAP.md,
`openspec/config.yaml`, 6 agent runbooks) dangle.

## What Changes

- **This change (Phase 1)**: section-by-section audit of the whole v2
  (§§1–23 + title/commitment notes). Each section gets one disposition:
  `covered` (cite docs/code), `covered-equivalent` (same capability, accepted
  shape difference), `deferred` (recorded won't-do/future — no action),
  `diverged-recorded` (code differs with change/ADR on file), or `question`
  (needs an owner decision before deletion).
- **Phase 2 (separate changes, only if audit finds them)**: genuine gaps.
- **Phase 3 (separate change, owner deletes)**: file deletion + pointer sweep
  (AGENTS.md, RULES.md, ROADMAP.md, `openspec/config.yaml`, runbooks,
  catalog comments, CHANGELOG). ADRs and archived changes are NOT rewritten
  (historical record) — this audit's citation map (§5 of design.md) is the
  resolution key, referenced from the deletion change.

## Non-goals

Implementing anything (audit is read-only); rewriting ADRs/history;
deciding Phase 2 scope (that comes out of the table); touching `references/`
(agent is still frozen out — deletion is the owner's action in Phase 3).

## Acceptance criteria

1. Every v2 section §§1–23 has a disposition + evidence pointer in design.md.
2. Every live "v2 §X" citation has a new home in the §5 map (or is marked
   historical-only).
3. Owner approves the table — approval gates Phase 2/3.
