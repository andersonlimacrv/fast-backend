# billing-card-menus — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/billing-card-menus/{proposal,tasks,design}.md`
- [x] 0.2 Inventário: popovers artesanais no card (`role="listbox"`/`role="menu"` + listeners de `document`) × pacote Radix `custom-ui/components/dropdown-menu` (usado pela sidebar e pelo item 10)

## S1 — Componentes

- [x] 1.1 `billing/credit-usage-card-menus.tsx`: `UsagePeriodMenu` (trigger com período + `ChevronDown` que rotaciona por `group-data-[state=open]`; conteúdo com `DropdownMenuRadioGroup`/`DropdownMenuRadioItem`) e `UsageActionsMenu` (trigger `MoreVertical` com `aria-label`, `side="top"`, itens data-driven)
- [x] 1.2 Ambos `modal={false}` (padrão da sidebar: sem prender foco/brigar com o Sheet)
- [x] 1.3 Itens do menu de ações mantêm `label`/`icon`/`onSelect`/`disabled` vindos do card

## S2 — Card

- [x] 2.1 `credit-usage-card.tsx`: removidos `activePopover`, `moreRef`, `periodRef`, listeners de `document`, `AnimatePresence`/`motion.div` dos popovers e os anims `popoverAnim`/`instantAnim`
- [x] 2.2 Card consome `UsagePeriodMenu` (PERIOD_OPTIONS + selectedPeriod) e `UsageActionsMenu` (moreOptions: Export CSV, Print history, Share report, Refresh data), mantendo download/anim/print
- [x] 2.3 Estados e handlers preservados (`handleDownload`, `downloadDone`, reset timer, `reduceMotion`)

## S3 — Testes + docs

- [x] 3.1 `ui-catalog.test.tsx` `describe("credit-usage-card")`: abre o período e seleciona outro (trigger atualiza); abre ações e executa Refresh data; fecha
- [x] 3.2 `entries.ts` n=7 (nota) + n=10 (consumo pelo card como evidência)
- [x] 3.3 `review-design` §13 linha 07 + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 07 (comportamento/teclado nos dois temas) — **validado em 2026-09-23**
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.3 Sem commit sem pedido

## S5 — Depois (fora daqui)

- [ ] 5.1 Validar o item 10 na prova própria dele (este consumo é evidência, não validação)
