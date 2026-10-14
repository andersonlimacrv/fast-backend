# references-cleanup — tasks

## S0 — Change

- [x] 0.1 `openspec/changes/references-cleanup/{proposal,tasks,design}.md` + owner mandate (delete after approved audit; owner's hands for the deletion itself)

## S1 — Deletion (owner, done 2026-10-13)

- [x] 1.1 `references/implementation_v2.md` deleted
- [x] 1.2 `references/components_to_use/` deleted (23 docs + 2 PNGs)

## S2 — Pointer sweep

- [x] 2.1 `AGENTS.md`: context + hierarchy + map (no `references/*`)
- [x] 2.2 `docs/RULES.md`: header + hierarchy + frozen-reference lines rewritten (principle survives: silent rewrites banned, ADR for divergences)
- [x] 2.3 `docs/ROADMAP.md`: alignment line (historical Fase-0 checkbox untouched)
- [x] 2.4 `openspec/config.yaml`: Frozen line + proposal rules (cite audit table + ADR)
- [x] 2.5 Runbooks: planner, backend-implementer (also fixed stale `CORE_MODULES=[…]`/`ENABLED_MODULES`/`MinIOStorage` copies → flags-as-registry + real adapter names), code-reviewer, tester, security-auditor (also recorded cookie-auth divergence), docs-writer
- [x] 2.6 Catalog comments (`entries.ts`, `types.ts`): historical wording, `ref` strings kept
- [x] 2.7 `docs/review-design.md`: deletion note on top, body untouched
- [x] 2.8 CHANGELOG record
- [x] 2.9 Verified: no live (non-historical) file references a path under `references/` — ADRs, archived changes, CHANGELOG entries and code port-provenance comments intentionally left as history

## S3 — Pendente do dono

- [ ] 3.1 Replacement inbox rule for future reference docs (one-liner; `lab-harness/design.md:28` growth rule points at the deleted folder)
- [ ] 3.2 Sem commit sem pedido
