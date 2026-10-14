# custom-ui-tabs — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-tabs/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`primitives-base-tabs` + demo via `animate-ui.com/r/*.json`) + inventário: `/ui/tabs.tsx` só com prova+testes, `@base-ui/react@1.8.0` com `render`+`keepMounted` no Panel (verificado nos `.d.ts`), `Highlight` com reduced-motion próprio, sem `auto-height` no projeto (reuso do nosso ResizeObserver)

## S1 — Componentes + deleção

- [x] 1.1 `custom-ui/components/tabs/primitive.tsx`: vendored (`Tabs` controlado + contexto, `TabsHighlight` spring 200/25 `click={false}`, `TabsHighlightItem`, `TabsList`, `TabsTab`, `TabsPanel` blur via `AnimatePresence`, `TabsPanels` auto-height com nosso ResizeObserver keyado pelo value + modo layout); `@base-ui/react/tabs` + `effects/highlight` + `getStrictContext` + `useControlledState`; sem `'use client'`
- [x] 1.2 `custom-ui/components/tabs/tabs.tsx`: lista `bg-muted rounded-lg p-1`; tab sem fill/hover próprio + `ring-2` + `disabled:`; Highlight default `bg-background` + sombra; painel `pt-4`; nomes upstream, sem alias
- [x] 1.3 Deletar `components/ui/tabs.tsx` por completo (sem dualidade — dono 2026-09-30)

## S2 — Prova + testes

- [x] 2.1 `catalog-demos.tsx`: prova = demo do doc (account/password com `ui/input` + `buttonVariants`) + gêmeo `mode="layout"` rotulado
- [x] 2.2 `ui-catalog.test.tsx`: `describe("tabs")` com semântica Base UI (troca de value, setas, pill, painel trocando, dois modes) + sem hover próprio no tab

## S3 — Docs

- [x] 3.1 `entries.ts` n=20 (`source: custom-ui/components/tabs/` + nota)
- [x] 3.2 `review-design` §13 (linha 20) + §14 (linha `tabs.tsx` quitada) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 20 + perf com dados reais → `status: "validated"` — **validado em 2026-09-30**
- [x] 4.2 Gates: `tsc`, `oxlint`, catálogo, build — **verdes em 2026-09-30** (`tsc` limpo, oxlint só warnings pré-existentes, catálogo 65/65, `vite build` ok)
- [ ] 4.3 Sem commit sem pedido
