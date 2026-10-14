# custom-ui-circular-progress — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-circular-progress/{proposal,tasks,design}.md` (revista em 2026-09-19 após o feedback do dono)
- [x] 0.2 Upstream consultado: registry `@magicui/animated-circular-progress-bar` + demo + `references/components_to_use/AnimatedCircularProgressBar.md`

## S1 — Porte fiel

- [x] 1.1 Reescrever `custom-ui/components/circular-progress.tsx`: dois `<circle>` com as CSS vars do upstream (`--gap-percent: 5`, `--percent-to-px`, `--percent-to-deg`, `--circumference`), `strokeDasharray` em `calc`, secundário `scaleY(-1)` e gate `0 ≤ % ≤ 90`
- [x] 1.2 Preservar o que é nosso: `role="progressbar"` + aria (valor real, não o frame), `aria-hidden` no svg/label, cores por token, `size`/`strokeWidth`/`showValue` e tabular-nums
- [x] 1.3 `ui/**` intocado

## S2 — Animação inicial

- [x] 2.1 `animateOnMount` (default `true`): preenche de `min` a `value` na montagem, com o número contando junto (motion `animate` + bezier do CSS `ease`, um driver só)
- [x] 2.2 `animateOnMount={false}`, `transitionLength <= 0` ou reduced-motion → valor final imediato (decisão derivada no render, sem `setState` em efeito)

## S3 — Prova + testes

- [x] 3.1 Prova no registro de demos: loop upstream (0→100 de 10 em 10, 2s) + `Replay mount` (remonta) + gêmeo `animateOnMount={false}` + variante fina sem label
- [x] 3.2 `ui-catalog.test.tsx`: primeiro render em 0 (default), `animateOnMount={false}` no valor, valor alcançado ao fim do preenchimento (30/30 verdes)

## S4 — Docs

- [x] 4.1 `entries.ts` (nota do 04) + `review-design.md` §13
- [x] 4.2 `CHANGELOG.md` `[Unreleased]`

## S5 — Verificação

- [x] 5.1 **Ok visual do dono** em `/admin/lab/trials` (card 04) — validado em 2026-09-19; `status: "validated"` (prova migrou para a Gallery). Defaults confirmados como a **variante completa**; demais combinações são opt-out
- [ ] 5.2 Gates quando pedidos: `tsc+build`, vitest, e2e full, `oxlint`
- [ ] 5.3 Sem commit sem pedido
