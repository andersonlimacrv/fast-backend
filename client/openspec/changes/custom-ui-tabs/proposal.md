# custom-ui-tabs — proposal

## Why

O item 20 (`Tabs`) usa um porte próprio em `/ui/tabs.tsx` (Base UI + `Tabs.Indicator` nativo + `TabsPanels` com ResizeObserver que não keya pelo value — dívida §14, "pill deslizante + motion | prova do 20"). O dono pediu (2026-09-30) **exatamente o `primitives/base/tabs` do animate-ui** (`https://animate-ui.com/docs/primitives/base/tabs`), com precedência dos moldes do projeto: o primitivo Base UI com o `Highlight` deslizante, painéis com blur e `TabsPanels` com auto-height.

## What Changes

- **Novo `custom-ui/components/tabs/primitive.tsx`** — vendored de `primitives-base-tabs` (precedente do toggle-group): `Tabs` (controlado via `value`/`defaultValue`/`onValueChange` + contexto), `TabsHighlight` (spring 200/25, `click={false}` — a seleção vem do Base UI, não do clique), `TabsHighlightItem`, `TabsList`, `TabsTab`, `TabsPanel` (blur 4px via `AnimatePresence`) e `TabsPanels` (`auto-height` com **nosso ResizeObserver** — molde já usado no `/ui`, sem vendorizar `AutoHeight`+`Slot`+hook — mas agora **keyado pelo `value` do contexto**, o que resolve a limitação admitida no `/ui`; modo `layout` com `layout="size"` como no doc). Sobre `@base-ui/react/tabs` (1.8.0 instalado; `render` + `keepMounted` verificados nos tipos) + `effects/highlight` + `getStrictContext` + `useControlledState`; sem `'use client'`.
- **Novo `custom-ui/components/tabs/tabs.tsx`** (nosso layout): lista `bg-muted rounded-lg p-1`; tab sem fill próprio e **sem hover** (lição do toggle-group — só o Highlight pinta seleção) + `focus-visible:ring-2 ring-ring` + `disabled:`; Highlight default `bg-background` com sombra (pill claro sobre a lista muted, como no demo); painel `pt-4`. Nomes do upstream (`TabsTab`, sem alias `Trigger`).
- **Deleção total do `/ui/tabs.tsx`** (dono, 2026-09-30: sem dualidade para não haver conflito depois) — inclui o `TabsIndicator` inventado e o `TabsPanels` antigo. Únicos consumidores (prova + testes) migram.
- **Prova reescrita**: demo do doc (forms account/password com nosso `ui/input` + `buttonVariants`) + gêmeo `mode="layout"` rotulado.
- **Testes migrados**: troca de value, teclado (setas), presença do pill (`data-slot="motion-highlight"`) e conteúdo do painel trocando, nos dois modes.
- **Docs**: `entries.ts` n=20 (`source: custom-ui/components/tabs/`), `review-design` §13 (linha 20) + §14 (linha `tabs.tsx` quitada), CHANGELOG.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 20 com o primitivo pedido, em prova demo completo.

## Impact

- Novos: `custom-ui/components/tabs/{primitive.tsx,tabs.tsx}`, change `custom-ui-tabs`.
- Deletado: `components/ui/tabs.tsx` (inteiro — sem dualidade).
- Alterados: `catalog-demos.tsx` (prova), `ui-catalog.test.tsx`, `entries.ts` (n=20), `review-design` §13/§14, CHANGELOG.
- **Intocados**: tokens, páginas, `effects/highlight`.

## Non-goals

Validar o item (fica `pending` até o ok visual + perf com dados reais do dono); modo `layout` além do gêmeo na prova.

## Acceptance criteria

1. `/admin/lab/trials` → card `20 Tabs`: pill desliza entre Account/Password; painéis trocam com blur; altura anima no `auto-height`; `disabled` não responde.
2. Teclado: setas movem entre tabs (roving do Base UI), ativação por Enter/Espaço.
3. Reduced motion: sem slide do pill, sem blur, altura instantânea.
4. Gates: `tsc`, `oxlint`, catálogo e build verdes; `/ui/tabs.tsx` não existe mais.
