# custom-ui-restructure — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-restructure/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Mover (eu)

- [x] 1.1 `git mv` p/ `custom-ui/` (pastas `sidebar/`, `dropdown-menu/`, `sheet/`, `tooltip/`; avulsos `collapsible.tsx`, `slot.tsx`; `effects/highlight.tsx`)
- [x] 1.2 Remap dos 12 imports (app-sidebar 3, ui-catalog 1, internos 8)

## S2 — Regra + verificação (eu)

- [x] 2.1 Seção custom-ui em `docs/CLIENT-STRUCTURE.md`
- [x] 2.2 **APRESENTAR árvore/diff ao dono ANTES dos gates** (ordem permanente)
- [x] 2.3 Gates: `tsc+build`, vitest 102, e2e 16/16 (sem regen — só paths), `oxlint` sem erros
- [ ] 2.4 Sem commit sem pedido

## S3 — `/ui` só shadcn default (dono)

- [x] 3.1 Excluídos `ui/collapsible.tsx` + `ui/tooltip.tsx` (redundantes); catálogo aponta p/ `custom-ui` (tooltip exige `TooltipProvider` — cobre com hover)
- [x] 3.2 Movidos 9 customs avulsos (`circular-progress`, `copy-button`, `file-tree`, `file-uploader`, `floating-input`, `gooey-menu`, `kpi-card`, `run-action-button`, `toaster`); importadores atualizados (8 arquivos)
- [x] 3.3 Gates: `tsc+build`, vitest 102, e2e 16/16, `oxlint` sem erros
- Nota: `file-uploader`/`run-action-button` seguem sem uso (implementação futura); `components.json` é só config (sem manifesto p/ sincronizar — aliases intactos)
