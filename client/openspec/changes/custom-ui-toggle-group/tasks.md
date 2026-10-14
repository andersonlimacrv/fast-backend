# custom-ui-toggle-group — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-toggle-group/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`primitives-radix-toggle-group` via `animate-ui.com/r/*.json` + página do doc) + inventário: `/ui/toggle-group.tsx` só com prova+testes, pacote `radix-ui` instalado, `Highlight` com reduced-motion próprio

## S1 — Componentes

- [x] 1.1 `custom-ui/components/toggle-group/primitive.tsx`: vendored (`ToggleGroup` single|multiple controlado, `ToggleGroupItem` motion.button, `ToggleGroupHighlight` spring 200/25 + `HighlightItem`, contextos); Radix + `effects/highlight` + `getStrictContext` + `useControlledState`; sem `'use client'`
- [x] 1.2 Guard de reduced-motion no `whileTap` do item (único delta comportamental)
- [x] 1.3 `custom-ui/components/toggle-group/toggle-group.tsx`: container `inline-flex gap-1`; item `h-9 min-w-9 rounded-md text-sm` + `focus-visible:ring-2 ring-ring` + `disabled:` + `svg:size-4`; Highlight default `bg-accent rounded-md`; nomes upstream, sem cva — **sem hover próprio** (fix 2026-09-30: `hover:bg-accent` removido, seleção só pelo Highlight como no demo)

## S2 — Prova + testes

- [x] 2.1 `catalog-demos.tsx`: prova reescrita (single + multiple, como no doc; corrige o array sem `type`) — multiple com `bg-accent rounded-md` por item, como no demo (fix 2026-09-30: sem isso o overlay é transparente)
- [x] 2.2 `ui-catalog.test.tsx`: `describe("toggle-group")` com semântica Radix (single string, multiple array, teclado, pill) + sem hover próprio + um overlay por item ativo no multiple

## S3 — Docs

- [x] 3.1 `entries.ts` n=21 (`source: custom-ui/components/toggle-group/` + nota)
- [x] 3.2 `review-design` §13 (linha 21) + §14 (dívida quitada) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 21 → `status: "validated"` — **validado em 2026-09-30** (sem hover próprio, seleção só pelo Highlight, como no doc)
- [x] 4.2 Gates: `tsc`, `oxlint`, catálogo, build — **verdes em 2026-09-30** (`tsc -b` limpo, oxlint só warnings pré-existentes, catálogo 61/61, `vite build` ok)
- [ ] 4.3 Sem commit sem pedido
