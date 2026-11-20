# references-cleanup — design

Executes Phase 3 of the owner's `references/` removal (mandate 2026-10-13),
gated by the approved `v2-coverage-audit` (all sections accounted for, §2.3
decided as flags-as-registry, zero confirmed gaps).

## Decisions

1. **History is not rewritten.** ADRs 0001–0009, archived changes, CHANGELOG
   entries and code port-provenance comments keep their `references/…`
   strings — they record what was true when written. The `v2-coverage-audit`
   §5 citation map resolves old "v2 §X" citations to current homes.
2. **Live loaders are repointed.** Hierarchy lines, runbook reading lists,
   `openspec/config.yaml` rules and catalog process comments now resolve to
   existing docs (audit table, RULES, ADRs, DEPLOYMENT). Verified by grep:
   no live file references a path under `references/`.
3. **Stale copies fixed, not just repointed.** `backend-implementer.md`
   embedded `CORE_MODULES=[…]` + `ENABLED_MODULES` + `MinIOStorage` — false
   after decision (a); now flags-as-registry + `S3CompatibleStorage`.
   `security-auditor.md` "sem sessions no core" gained the recorded cookie
   divergence (`auth-cookies-http-only`). `code-reviewer`/`planner`/
   `docs-writer` nomenclature lines aligned to conceptual-only `CORE_MODULES`.
4. **ROADMAP Fase-0 checkbox untouched** (`references/… congelada` as a
   completed item is a true historical log); only the live alignment line
   was repointed.
5. **Open:** replacement inbox rule for future reference docs (owner
   one-liner). Until decided, `lab-harness/design.md:28` growth rule dangles
   — flagged in tasks 3.1, not silently edited.
