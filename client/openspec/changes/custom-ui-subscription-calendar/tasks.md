# custom-ui-subscription-calendar — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-subscription-calendar/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (as duas variantes do doc) + inventário: `source: null` (último não portado), `xs:` inexistente no tema, `activeGlow` fixo (vazaria entre instâncias), `Loader2`→`LoaderCircle`, `TbCube` ausente em `lib/icons`

## S1 — Componente

- [x] 1.1 `custom-ui/components/subscription-calendar.tsx`: card + header (mês/ano, Today, prev/next, "+") com a entrada `scale 0.96 → 1` (spring 420/28/0.6)
- [x] 1.2 Overlays (add/busca/resumo) com o shell do doc (blur, X, badge por variante, transição scale/y) e conteúdos próprios
- [x] 1.3 Semana em pills, grade de dias (`aspect-square sm:h-12`, muted/normal, glow `layoutId` **escopado por `useId`**, logos + indicadores)
- [x] 1.4 Footer (legenda MONTHLY/YEARLY + SUBS/NEW) e barra inferior (busca/exportar com `LoaderCircle`/resumo + MONTHLY TOTAL)
- [x] 1.5 Deltas: `rounded-xl` (tokens do tema — regra do dono), `xs:` → `sm:`, press-only no "+", timer do exportar limpo, aria + `ring-2` + reduced-motion
- [x] 1.6 Hover sutil nos dias (`hover:border-muted-foreground/20`) — o `hover:border-input` do doc era morto (`--input` = `--border` desde o `design-contrast-borders`); fundo do selecionado em `bg-primary/60` (dono: valor seco, mesma spec)

## S2 — Ícones + prova + testes

- [x] 2.1 `lib/icons.tsx`: `TbCube` (pack tb já usado); demais ícones já existiam
- [x] 2.2 `catalog-demos.tsx`: demo com mês navegável e dias do doc (logos em iniciais coloridas, indicadores em dots)
- [x] 2.3 `ui-catalog.test.tsx`: render (mês/total), prev/next pelos callbacks, seleção de dia (`aria-pressed`) e os overlays de add/busca/resumo

## S3 — Docs

- [x] 3.1 `entries.ts` n=18 (`source: custom-ui/components/subscription-calendar.tsx` + nota)
- [x] 3.2 `review-design` §13 (linha 18) + §9 (errata: fila de portes zerada) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 18 → `status: "validated"` — **validado em 2026-09-23**
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.3 Sem commit sem pedido
