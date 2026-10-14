# custom-ui-inputs — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-inputs/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`floating-input.json` do registry Watermelon) + inventário: só `bg-input` diverge; `ui/input` já `bg-background`

## S1 — Componente

- [x] 1.1 `floating-input.tsx`: `bg-input` → `bg-transparent` + `hasValue` inicial de `value`/`defaultValue` + notch medido (leading/gap/trailing, sem chip)
- [x] 1.2 Autofill (dono): congelar o repaint do UA + tinta `muted/60` via inset shadow (`index.css`, fora de `@layer` — utilities do Tailwind venceriam a base)

## S2 — Prova + testes

- [x] 2.1 `catalog-demos.tsx`: variações rotuladas (email, password, pré-preenchido, disabled, plain)
- [x] 2.2 `ui-catalog.test.tsx`: `describe("floating-input")` estendido (bg, pré-preenchido, disabled, tipos)

## S3 — Docs

- [x] 3.1 `entries.ts` n=14 (`source` + nota)
- [x] 3.2 `review-design` §13 (linha 14) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 14 → `status: "validated"` — **validado em 2026-09-30** (notch, coreografia e tinta de autofill)
- [x] 4.2 Gates: `tsc -b`, `oxlint`, catálogo, build — **verdes em 2026-09-30** (`tsc -b` limpo; catálogo 74/74, `vite build` ok; browser light+dark: notch medido, sem chip, sem linha sobre o texto, zero erros)
- [ ] 4.3 Sem commit sem pedido
