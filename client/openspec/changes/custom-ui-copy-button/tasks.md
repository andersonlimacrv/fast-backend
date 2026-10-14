# custom-ui-copy-button — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-copy-button/{proposal,tasks,design}.md`
- [x] 0.2 Upstream consultado: registry `components-buttons-copy` + `primitives-buttons-button` + API reference na doc do site

## S1 — Componente

- [x] 1.1 `copy-button.tsx` reescrito: cva do site (7 variantes + tamanhos quadrados `size-9`/`size-7`/`size-8`/`size-10`)
- [x] 1.2 Troca de ícone com `AnimatePresence mode="popLayout"` (`scale` + `blur(4px)`, 0.25s) e reduced-motion
- [x] 1.3 API do site: `content`/`copied`/`onCopiedChange`/`delay`/`tapScale` + clipboard assíncrono sem `console.error` e timer limpo no unmount; **`hoverScale` não exposto** (hover removido a pedido do dono, só press)
- [x] 1.4 Deltas: `ring-2` (DESIGN.md §8) e `lib/icons` (regra de ouro)

## S2 — Produção + prova

- [x] 2.1 `admin/Orgs.tsx` e `admin/Users.tsx`: `variant="ghost"` explícito (default do site é preenchido; inline ao lado de ID fica barulhento)
- [x] 2.2 Prova: 7 variantes + 4 tamanhos + nota do efeito
- [x] 2.3 `entries.ts`: nota do porte no item 06

## S3 — Testes + docs

- [x] 3.1 Teste existente do copy-button verde sem mudanças (32/32 no catálogo)
- [x] 3.2 `review-design.md` §13 (linha do 06) + §13 do 05 marcada como ✅ validated
- [x] 3.3 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [ ] 4.1 **Ok visual do dono** em `/admin/lab/trials` (card 06) → `status: "validated"`
- [ ] 4.2 Gates quando pedidos: `tsc+build`, vitest, e2e full, `oxlint`
- [ ] 4.3 Sem commit sem pedido
