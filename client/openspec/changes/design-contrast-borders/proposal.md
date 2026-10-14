## Why

O `--primary` do tema é uma lima clara (`oklch(0.8487 0.2181 127.8)`, L≈0.85). Medido em 2026-09-19 (`review-design` §15): como **preenchimento** no light ela dá **1.19–1.51:1** contra fundo claro (some como forma), enquanto o par `primary-foreground`-sobre-`primary` dá 9.11:1; e `--ring = --primary` estende o problema a **todo foco em light** (1.51:1, abaixo dos 3:1 de WCAG 1.4.11). O `--border`/`--input` do light também estava em 2.39:1 contra branco.

O dono (2026-09-23) pediu **mais camadas de contorno, principalmente no light, para destacar as cores** — escopo "tokens + componentes", intensidade "equilibrada" (`--border` 3.12:1, `--ring` 4.92:1).

## What Changes

- **Tokens do light** (`client/src/index.css`, `:root`):
  - `--border` e `--input`: `oklch(0.7309 0.0114 286.1138)` → **`oklch(0.66 0.0114 286.1138)`** (2.39:1 → **3.12:1** sobre branco).
  - `--ring`: `--primary` → **`oklch(0.5351 0.1432 133.8754)`** (= `--chart-3`) (1.51:1 → **4.92:1**).
  - `.dark` **intacto** (`--border` 0.3195; ring já a 11:1).
- **Regra no `DESIGN.md`** (nova §4.5 "Contorno de preenchimentos coloridos (light-first)" + bullet na §8 + entradas datadas no log final): todo preenchimento colorido ganha **contorno no tom do conteúdo** (`border-*-foreground/80`) no light.
- **Aplicação nos componentes**:
  - `custom-ui/components/switch.tsx`: fundo cheio (`bg-primary`) e **alphas calibrados pelo dono na validação** — mesmo valor no trilho e no knob por estado: `border-primary-foreground/30` no ativo e `border-border/50` no inativo (mais suaves que o 3:1 geral, decisão estética).
  - `custom-ui/components/checkbox.tsx`: marcado/indeterminado com `border-primary-foreground/80` (antes herdava o `--border` neutro, que sumia no verde).
  - `billing/credit-usage-card.tsx`: segmentos preenchidos com `border-primary-foreground/60` — **exceção à base `/80`** (achado do dono na validação: com `sm:gap-1` cada segmento fica com ~2,4px no `md` e uma borda pesada engole o fill; `/60` é o valor seco pedido por ele, 2.15:1 contra o fill de propósito — a barra lê pelo preenchimento e pelos gaps); a barra subiu para `h-3.5` e `gap-px` (barras mais compridas e ligeiramente mais largas) e as **barras vazias** passaram a `muted-foreground/70` nos **dois temas** (o `muted` puro ficava a 1.01:1 contra o trilho no dark e 1.40:1 no light; dono: "mesmo padrão no light").
- **Docs de estado**: `review-design` §15 fecha a pendência com os novos números; notas 05/07/25 no `entries.ts`.
- **Testes**: nenhum novo (mudança de cor/token); o catálogo segue 35/35.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: itens 05/07/25 recebem a camada de contorno (registro em `review-design` §13).

## Impact

- Alterados: `client/src/index.css` (3 tokens do `:root`), `docs/DESIGN.md` (§4.5 + §8 + log), `docs/review-design.md` (§13/§15), `client/src/components/custom-ui/components/{switch,checkbox}.tsx`, `client/src/components/billing/credit-usage-card.tsx`, `client/src/lib/catalog/entries.ts`, `CHANGELOG.md`.
- **Intocados**: `.dark`, `components/ui/**`, `theme-toggle.tsx` (sem primary).

## Non-goals

Convergir `Grants`/toggle do card para o `25 Switch` (fica como follow-up); redesenhar `--primary` (o tema tweakcn segue); alterar o dark mode.

## Acceptance criteria

1. `/admin/lab/trials` → cards 05/07/25: o verde e o knob têm aresta visível no light; o foco (Tab) mostra um anel escuro visível em ambos os temas.
2. Contraste medido: `--border`/`--input` 3.12:1, `--ring` 4.92:1, ícones sobre o trilho ativo ≥4.5:1, knob×trilho ≥1.25:1 com aresta.
3. Dark mode sem regressão visual.
4. Gates: `tsc`, `oxlint` e o catálogo (35/35) verdes.
