# segmented-usage-bar — proposal

## Why

A barra segmentada do `CreditUsageCard` (item 07) é o último trecho do bloco que não tem componente próprio: ela é montada inline no card (75 células `flex-1`, `h-3.5`, `gap-px`) e o dono notou, na validação visual, que **as barras não têm o mesmo espaçamento/ritmo** entre si. A causa é estrutural: as células **preenchidas** carregam `border` (1px) e as **vazias** não têm borda nenhuma — larguras nominais iguais, caixas diferentes — somado ao arredondamento de fração do `flex-1`. O dono pediu (2026-09-23): extrair um **componente reutilizável controlado**, validá-lo no lab com um **input tipo slider** ligado ao valor da label, com **altura default parametrizável**.

## What Changes

- **Novo `custom-ui/components/segmented-progress-bar.tsx`** — `SegmentedProgressBar` (presentacional, controlado, sem estado):
  - props: `value` (obrigatório), `max = 100`, `segments = 75`, **`heightPx = 14`**, `label = "Credits used"`, `className`;
  - trilho em **grid de colunas iguais** (`repeat(segments, minmax(0, 1fr))`, inline — sem classe dinâmica de Tailwind) com `gap-px`; **todas as células com a mesma caixa** (`min-w-0 rounded-sm border`), vazias em `border-transparent` — corrige o ritmo desigual;
  - cores na calibração validada (DESIGN.md §4.5): preenchidas `bg-primary` + rim `border-primary-foreground/60`, vazias `bg-muted-foreground/70` nos dois temas; **fade original preservado** (`opacity: 1 - i * 0.004`) — decisão do dono;
  - `role="progressbar"` + `aria-valuemin/valuemax/valuenow/label`, com clamp em `0..max` (guard para `max <= 0`); altura por `style` inline (px).
- **Card consome o componente**: o bloco inline de 75 células sai do `credit-usage-card.tsx` (e a const `SEGMENTS`), entrando `<SegmentedProgressBar value={painted} ariaValueNow={clamped} className="bg-muted/50 px-4 sm:px-6 md:px-8" />`; a label `{clamped}%` acima continua dona do mesmo valor (layout da label intocado).
- **Mount fill no card** (dono, 2026-09-23): `animateOnMount` (default `true`) + `transitionLength` (default 1000ms) espelhando o driver validado do `CircularProgress` (04) — ao entrar, **label e barra sobem de 0 até o valor** (mesmo valor pintado, nunca desandam); `jumpsToTarget` derivado em render (reduced-motion / `false` = instantâneo) e `controls.stop()` no cleanup. `data-current-value` no root do card para os testes acompanharem o pintado.
- **Tipografia do valor** (dono, 2026-09-23): o `%` do card troca `font-sans` por **`font-mono tabular-nums`** (mesmo tamanho/peso), a mesma do harness do lab.
- **Prova do lab** vira estação de validação: além do slider, ganha um switch de `animateOnMount` (remonta para repetir o fill) e uma seção **"Modules of this block"** que renderiza `SegmentedProgressBar`, `UsagePeriodMenu`, `UsageActionsMenu` e o `25 Switch` **separados, com legenda de arquivo** — o mapa de módulos do bloco.
- **Slider do lab tematizado**: `@layer components .lab-range` no `index.css` (thumb sólido `--primary` com rim `--primary-foreground`, trilho `--muted`, altura que não corta o knob) — o thumb nativo two-tone/cortado sai do caminho; é harness de prova, não componente.
- **Barra**: nova prop `ariaValueNow` (default = `value`) para anunciar o valor real enquanto pinta o fill — o mesmo padrão do 04.
- **Testes**: `describe("segmented-progress-bar")` (mesma caixa em todas as células, contagem por `value`/`segments`, aria + clamp), asserção do card ligando `usedCreditsPercent` à label/barra e o **fill de montagem** (pinta 0 enquanto o aria já reporta o alvo, e chega ao alvo com `transitionLength` curto).
- **Docs**: nota do 07 no `entries.ts`, `review-design` §13, CHANGELOG.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 07 com barra extraída e prova interativa (slider).

## Impact

- Novos: `client/src/components/custom-ui/components/segmented-progress-bar.tsx`, change `segmented-usage-bar`.
- Alterados: `client/src/components/billing/credit-usage-card.tsx`, `client/src/components/catalog-demos.tsx` (prova), `ui-catalog.test.tsx`, `client/src/lib/catalog/entries.ts` (nota do 07), `docs/review-design.md` §13, `CHANGELOG.md`.
- **Intocados**: tokens/tema, a label e o resto do card (histórico, menus, switch, download).

## Non-goals

Criar entrada nova de catálogo (a barra é parte do 07 — `source` do item segue o card); adicionar o slider ao componente de produção (é só prova); repaginar a label.

## Acceptance criteria

1. `/admin/lab/trials` → card `07`: o slider varia 0→100 e a label (`{n}%`) e a barra acompanham juntas, sem saltos.
2. As células têm **o mesmo espaçamento** em qualquer valor (cheio/vazio), nos dois temas e em larguras diferentes — em `0`, `25`, `50`, `75` e `100`.
3. Altura default 14px e parametrizável por `heightPx`.
4. Teclado/aria: slider focável (setas), barra com `role="progressbar"` e `aria-valuenow` acompanhando o valor **real** mesmo durante o fill.
5. **Mount fill**: ao entrar na tela a label e a barra sobem de 0 até o valor; o switch da prova remonta e repete; `animateOnMount={false}` (ou reduced-motion) entra direto no valor.
6. **Tipografia**: o `%` do card em `font-mono tabular-nums`, igual ao harness.
7. **Mapa de módulos** na prova: `SegmentedProgressBar`, `UsagePeriodMenu`, `UsageActionsMenu` e `Switch` renderizados separados com legenda de arquivo.
8. Gates: `tsc`, `oxlint`, catálogo e build verdes.
