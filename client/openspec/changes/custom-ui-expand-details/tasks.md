# custom-ui-expand-details — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-expand-details/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`ExpandDetails.md`, as duas variantes) + inventário: `react-use-measure` não instalado (§7), `zinc` fixo (§12), sem `source`/prova no catálogo

## S1 — Componente

- [x] 1.1 `custom-ui/components/expand-details.tsx`: coreografia do doc (width 320↔120, height medido, spring 200/22/1.2, delays invertidos, chevron -90° em 0.2s, painel blur 8px + y com `popLayout`); **cantos do tema** (`rounded-xl` → `var(--radius-xl)`, sem o morph 20↔24 nem pill — dono 2026-09-23)
- [x] 1.2 **Sem `react-use-measure`**: `ResizeObserver` local (fallback `auto` e guard para jsdom sem RO)
- [x] 1.3 Tokens (`bg-card`/`border-border`/`text-muted-foreground`/`text-foreground`), `ring-2` de foco (DESIGN.md §8), `aria-expanded`
- [x] 1.4 API: `title`, `items` (default do doc, com `wide` para o `col-span-2`), `defaultOpen`, `expandedWidth`, `collapsedWidth`, `className`; reduced-motion instantâneo

## S2 — Prova + testes

- [x] 2.1 `catalog-demos.tsx`: bloco default + exemplo data-driven (`Run`, 3 itens, `defaultOpen={false}`)
- [x] 2.2 `ui-catalog.test.tsx`: abre por padrão (`aria-expanded`), colapsa no clique (painel sai pelo `AnimatePresence`), `defaultOpen={false}` + `items` custom; e os cantos vêm do tema (`rounded-xl`, sem `border-radius` inline)

## S3 — Docs

- [x] 3.1 `entries.ts` n=11 (`source: custom-ui/components/expand-details.tsx` + nota)
- [x] 3.2 `review-design` §13 (linha 11) + §9 (deferimento resolvido) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 11 → `status: "validated"` — **validado em 2026-09-23** (com os cantos do tema)
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.3 Sem commit sem pedido
