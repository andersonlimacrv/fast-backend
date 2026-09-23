## Why

Temos **três** switches no app e nenhum em `/custom-ui`:

| Onde | O que é | Consumo |
|---|---|---|
| `components/ui/switch.tsx` | Base UI Switch (base shadcn) | Produção (`pages/grants/Grants.tsx`) — página consumindo `/ui` direto |
| `components/billing/credit-usage-card.tsx` | Toggle próprio (`role="switch"` + knob) | Produção (o card) |
| `components/theme-toggle.tsx` | Pill sol/lua = item 19 `SwitchModeToggle` | Produção (topbar) |

O dono pediu (2026-09-19): **extrair um componente base a partir do `SwitchModeToggle`**, para ser reutilizado. A medição que motivava o "depois": no light, `--primary` (lima claro, L≈0.85) como preenchimento sobre fundo claro dá **1.19–1.51:1** (segmentos do card e knob do toggle), enquanto no dark dá 11:1; e `--ring = --primary` deixa o foco em light com 1.51:1. Em 2026-09-23 o dono aprovou o base visualmente (fundo verde no ativo) e pediu as opacidades + as camadas de contorno, resolvidas na change **`design-contrast-borders`**.

## What Changes

- **Novo `custom-ui/components/switch.tsx`** — base reutilizável extraída do `SwitchModeToggle`:
  - trilho pill, knob que desliza com **spring** (`layout` + `transition`, `500/32`) e conteúdo fixo em cada metade (`startContent`/`endContent`) onde **o lado do knob lê como ativo**;
  - **cores pela linguagem do Checkbox validado** (dono, 2026-09-19) + **camada de contorno** (`design-contrast-borders`, 2026-09-23, alphas calibrados pelo dono na validação): **ativo = trilho `bg-primary` (fundo cheio) com `border-primary-foreground/30`**, knob `bg-background` + `border-primary-foreground/30`, ícone ativo sobre o knob em `text-foreground` e o inativo sobre o verde em `text-primary-foreground` (9.11:1, o par do Checkbox); **inativo = `bg-background` + `border-border/50`**, knob `bg-muted` + `border-border/50`; `transition-colors duration-500` como o Checkbox;
  - controlado (`checked`/`onCheckedChange`) ou não (`defaultChecked`), `width`/`height`, `knobClassName`/`trackClassName`, `transition`, `disabled`;
  - `role="switch"` + `aria-checked`, foco `ring-2` (DESIGN.md §8), reduced-motion desliga o `layout`.
- **`theme-toggle.tsx` NÃO consome o base** (dono, 2026-09-23): o controle de tema é **escolha de estado** (sun|moon), não on/off, então mantém a implementação própria (restaurada do HEAD) e **sem cores primary** (`bg-muted` no knob, `border-border` no trilho).
- **Catálogo**: nova entrada **`25 Switch`** (`component`/`base`, `ref: SwitchModeToggle.md`) com prova no registro de demos (default, off, disabled, small, large e um controlado com `startContent`/`endContent`). O primeiro consumidor chegou depois da validação: o toggle do `CreditUsageCard` (07), pela mesma mudança deste base (tasks 5.2a).
- **Testes**: +3 casos do `Switch` (toggle não-controlado com `onCheckedChange`, valor controlado, `disabled` não alterna); 35/35 no catálogo.

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: item base `Switch` catalogado e provado; o item 19 segue com implementação própria.

## Impact

- Novos: `client/src/components/custom-ui/components/switch.tsx`, change `custom-ui-switch`.
- Alterados: `client/src/components/catalog-demos.tsx` (prova), `client/src/lib/catalog/entries.ts` (n=25), `client/src/components/ui/ui-catalog.test.tsx` (+3), `docs/review-design.md` §13, `CHANGELOG.md`.
- **Intocados**: `components/ui/**` (a base shadcn segue; a convergência de Grants fica para depois), `theme-toggle.tsx` (restaurado — o base não o consome) e **nenhum token do tema** (os tokens do light mudaram na `design-contrast-borders`).

## Non-goals

Convergir Grants para o `custom-ui`; trocar o toggle do `CreditUsageCard`; editar `/ui`; trocar a semântica/implementação do theme-toggle.

## Acceptance criteria

1. `/admin/lab/trials` → card `25 Switch`: default acende (trilho verde suave com contorno), off apaga, disabled não alterna, small/large mudam o tamanho, e o controlado escreve "on/off" com o conteúdo das metades aceso no lado ativo.
2. A topbar (`ThemeToggle`) continua alternando o tema com a **implementação própria** e sem primary (mesma aparência de antes do refactor).
3. Teclado: `role="switch"` focável (Tab), Espaço/Enter alternam, `ring-2` visível; `aria-checked` acompanha.
4. Reduced motion: knob pula sem animação.
5. Gates: `tsc`, `oxlint` e o teste do catálogo verdes.
