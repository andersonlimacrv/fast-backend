# menu-highlight-flicker — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/menu-highlight-flicker/{proposal,tasks,design}.md`
- [x] 0.2 Diagnosis measured in a real browser (Playwright sampling): 12/12 ghost frames pre-fix (2–4 pills/item), single-pill handoff post-fix

## S1 — Fix

- [x] 1.1 `dropdown-menu/primitive.tsx`: `DropdownMenuHighlight` defaults `exitDelay={0}`
- [x] 1.2 `effects/highlight.tsx`: instant exit (`{duration: 0}`) when effective exit delay is 0 (opt-in only)

## S2 — Verificação

- [x] 2.1 Browser re-measurement: 1 visible pill/frame, smooth opacity sum (screenshot `menu-fixed`)
- [ ] 2.2 Owner visual ok on org + Projects menus (both themes)
- [x] 2.3 Gates: `tsc -b`, `oxlint`, vitest, build — **verdes em 2026-10-01** (`tsc -b` limpo, oxlint só warnings pré-existentes do vendored, 86/86, `vite build` ok)
- [ ] 2.4 Sem commit sem pedido

## Notes

- jsdom can't cover animation timing (same rationale as the tabs/toggle-group motion tests) — the regression evidence is the browser measurement recorded here.
