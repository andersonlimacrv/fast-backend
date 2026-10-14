# segmented-usage-bar — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/segmented-usage-bar/{proposal,tasks,design}.md`
- [x] 0.2 Diagnóstico do ritmo desigual: células preenchidas com `border` × vazias sem borda + arredondamento do `flex-1`

## S1 — Componente

- [x] 1.1 `custom-ui/components/segmented-progress-bar.tsx`: controlado (`value`, `max = 100`, `segments = 75`, `heightPx = 14`, `label`, `className`), sem estado interno
- [x] 1.2 Trilho em grid (`repeat(segments, minmax(0, 1fr))` inline) + `gap-px`; células idênticas (`min-w-0 rounded-sm border`), vazias em `border-transparent`
- [x] 1.3 Cores validadas (preenchidas `bg-primary` + `border-primary-foreground/60`; vazias `bg-muted-foreground/70`) e fade `1 - i * 0.004` preservado
- [x] 1.4 Aria (`progressbar` + `valuemin/valuemax/valuenow/label`) com clamp `0..max` e guard para `max <= 0`

## S2 — Card

- [x] 2.1 `credit-usage-card.tsx` consome `<SegmentedProgressBar>` (sai o bloco inline de 75 células e a const `SEGMENTS`); label `{clamped}%` intocada e ligada ao mesmo valor
- [x] 2.2 Layout do card preservado (`bg-muted/50 px-4 sm:px-6 md:px-8` via `className`)
- [x] 2.3 **Mount fill entry-only** (`animateOnMount` default `true` + `transitionLength` default 1000ms): alvo travado no mount (`entryTarget`) + `settled`; mudança de prop durante/depois do fill liquida na hora (cleanup mata o tween), `onUpdate` arredonda para 1 casa e ignora frames no-op, `onComplete` crava o alvo; `data-current-value` no root; reduced-motion/`false` instantâneo
- [x] 2.4 Tipografia do valor do card em `font-mono tabular-nums` (mesmo tamanho/peso)

## S3 — Prova interativa + testes

- [x] 3.1 `catalog-demos.tsx`: demo do 07 com `<input type="range" min=0 max=100 step=0.1>` controlando `usedCreditsPercent` + valor exibido
- [x] 3.2 Slider tematizado por `.lab-range` (`index.css`, `@layer components`): thumb sólido `--primary` + rim, trilho `--muted`, altura que não corta o knob
- [x] 3.3 Switch de `animateOnMount` na prova (remonta para repetir o fill) + seção **"Modules of this block"** com `SegmentedProgressBar`, `UsagePeriodMenu`, `UsageActionsMenu` e `Switch` separados e legendados
- [x] 3.4 `ui-catalog.test.tsx`: `describe("segmented-progress-bar")` — mesma caixa, contagem, aria + clamp; card liga valor à label/barra; mount fill (0 pintado, alvo no aria, chega ao alvo com `transitionLength` curto); **prop após o fill aplica na hora** e **prop no meio do fill cancela e sincroniza**
- [x] 3.5 `ariaValueNow` na barra (anuncia o valor real durante o fill, padrão do 04)

## S4 — Docs + verificação

- [x] 4.1 `entries.ts` nota do 07 + `review-design` §13 linha 07 + CHANGELOG
- [x] 4.2 Ok visual do dono no card 07 com o slider (0/25/50/75/100, dois temas) — **validado em 2026-09-23** (incluindo o entry-only durante/depois do fill e o mapa dos módulos)
- [ ] 4.3 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.4 Sem commit sem pedido
