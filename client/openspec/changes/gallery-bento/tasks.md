# gallery-bento — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/gallery-bento/{proposal,tasks,design}.md` + proposta `ui-designer` a partir do DESIGN.md

## S1 — Aprovação

- [ ] 1.1 Ok do dono no desenho (grid/spans/header) antes de implementar

## S2 — Implementação (`Gallery.tsx` apenas)

- [x] 2.1 Seções `@container` + grade 1/2/3 col com `grid-flow-dense`, `items-start`, `gap-8` entre seções
- [x] 2.2 Span map (8 slugs largos → 2 col em container ≥2 col; resto 1 col)
- [x] 2.3 Wrappers `min-w-0` + centralização dos 4 demos com teto
- [x] 2.4 Header slim (`text-sm`, sem `StatusBadge`, `UsageList` intacto, paddings)
- [x] 2.5 Redistribuição (dono): grade `items-stretch` + `Card h-full flex flex-col` + conteúdo `flex-1 justify-center` — tiles baixos ocupam a linha (bordas alinhadas) com o conteúdo respirando centralizado; o branco sai do vão entre cards para dentro do tile

## S3 — Verificação

- [x] 3.1 Gates: `tsc -b`, `oxlint`, vitest full, `vite build` — **verdes em 2026-10-13** (`tsc` limpo, oxlint sem achado na Gallery, 169/169, build ok)
- [x] 3.2 Visual do dono: light/dark × drawer/rail/expanded, sem blowout — **validado em 2026-10-13** (redistribuição 2.5 incluída)
- [ ] 3.3 Sem commit sem pedido
