# design-contrast-borders — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/design-contrast-borders/{proposal,tasks,design}.md`
- [x] 0.2 Mediuns (2026-09-19, `review-design` §15) confirmadas: `--border` 2.39:1, `--ring` 1.51:1, fills 1.19–1.51:1

## S1 — Tokens do light

- [x] 1.1 `--border`/`--input` → `oklch(0.66 0.0114 286.1138)` (3.12:1)
- [x] 1.2 `--ring` → `--chart-3` `oklch(0.5351 0.1432 133.8754)` (4.92:1)
- [x] 1.3 `.dark` intocado (verificado no diff)

## S2 — Regra + aplicação

- [x] 2.1 `DESIGN.md` §4.5 (regra + tabela de tokens) + bullet na §8 + 2 entradas no log datado
- [x] 2.2 `switch.tsx`: fundo cheio `bg-primary`; bordas com alphas calibrados pelo dono na validação — `border-primary-foreground/30` (ON) e `border-border/50` (OFF), iguais no trilho e no knob
- [x] 2.3 `checkbox.tsx`: `border-primary-foreground/80` no marcado/indeterminado (+ largura de borda para a variante `accent`)
- [x] 2.4 `credit-usage-card.tsx`: segmentos preenchidos com o contorno em `/60` (exceção à base `/80` — segmentos finos, valor seco pedido pelo dono) + barra `h-3.5` com `gap-px` (barras mais compridas e ligeiramente mais largas) + barras vazias em `muted-foreground/70` nos dois temas (no light o `muted` ficava a 1.40:1 contra o trilho; correções do dono na validação)

## S3 — Docs de estado

- [x] 3.1 `review-design` §15 fechada (números finais + follow-up) e §13 (linhas 05/25)
- [x] 3.2 `entries.ts`: notas 05/07/25
- [x] 3.3 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [ ] 4.1 Re-medição dos pares e conferência visual do dono em `/admin/lab/trials` (cards 05/07/25) nos dois temas
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo 35/35
- [ ] 4.3 Sem commit sem pedido
