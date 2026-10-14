# custom-ui-accordion — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-accordion/{proposal,tasks,design}.md` + aprovação do dono (2026-09-19)

## S1 — Componente

- [x] 1.1 `custom-ui/components/accordion.tsx` sobre o `Collapsible` (radix + AnimatePresence): `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`, `multiple`, `keepRendered`, chevron data-state, reduced-motion
- [x] 1.2 `ui/**` intocado (base shadcn)
- [x] 1.3 Reveal `mask` (padrão do accordion, fiel ao upstream): `CollapsibleContent` ganha `reveal="slide"|"depth"|"mask"` — `mask` porta a máscara CSS animada (`--mask-stop` 0%→100%) + `y: 20` do `primitives-base-accordion`, corrigindo o texto sobre a separadora do `slide` puro
- [x] 1.4 Spring `150/22` como transition padrão do painel (igual ao componente upstream)
- [x] 1.5 `onHover` (default `false`) no `Collapsible` **e** no `Accordion`: abre no `mouseenter`, fecha no `mouseleave`, mesmo caminho do clique; handlers compostos; clique/teclado/touch preservados

## S2 — Catálogo + prova

- [x] 2.1 `entries.ts`: `02 source` → `custom-ui/components/accordion.tsx` + nota do padrão visual
- [x] 2.2 `entries.ts`: novo `24 Collapsible` (`component`/`base`, `pending`, `ref: AnimateUi/Sidebar.md`, `usedIn` shell)
- [x] 2.3 Prova do 02 no registro de demos: mask single, `onHover`, mask multiple, mask `keepRendered` e `depth` (alternativa)

## S3 — Docs

- [x] 3.1 `CLIENT-STRUCTURE.md`: regra `/ui` intocado + `/custom-ui` como consumo de página + dívida declarada
- [x] 3.2 `ARCHITECTURE.md` + `.pt-BR.md`: espelho de 1 linha
- [x] 3.3 `review-design.md`: §13 atualizado (02, 24) + §14 dívida declarada (tabela)
- [x] 3.4 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [x] 4.1 **Ok visual do dono** em `/admin/lab/trials` (02 com mask/onHover/multiple/keepRendered/depth) — validado em 2026-09-19; `status: validated` no catálogo (prova migrou para a Gallery)
- [ ] 4.2 Gates quando pedidos: `tsc+build`, vitest, e2e full, `oxlint`
- [ ] 4.3 Sem commit sem pedido
