# custom-ui-toggle-group — proposal

## Why

O item 21 (`ToggleGroup`) usa um porte próprio em `/ui/toggle-group.tsx` (Base-UI + cva de variantes + contexto) — dívida §14 ("variantes do referência + contexto | prova do 21"). O dono pediu (2026-09-23) o **`primitives/radix/toggle-group` do animate-ui** (`https://animate-ui.com/docs/primitives/radix/toggle-group`), **com nosso layout e nossas diretrizes**: o primitivo Radix com o `Highlight` deslizante (single com pill, multiple com overlay por item), sem o sistema cva que nada consome.

## What Changes

- **Novo `custom-ui/components/toggle-group/primitive.tsx`** — vendored de `primitives-radix-toggle-group` (precedente do dropdown-menu): `ToggleGroup` (single|multiple, controlado via `value`/`defaultValue`/`onValueChange`), `ToggleGroupItem` (motion.button + `whileTap`, com guard de reduced-motion como único delta comportamental), `ToggleGroupHighlight` (spring 200/25) + `ToggleGroupHighlightItem`, contextos — sobre Radix + `effects/highlight` (que já trata reduced-motion sozinho) + `getStrictContext` + `useControlledState`; sem `'use client'`.
- **Novo `custom-ui/components/toggle-group/toggle-group.tsx`** (nosso layout): container `inline-flex gap-1`; item `h-9 min-w-9 rounded-md text-sm` + `focus-visible:ring-2 ring-ring` + `disabled:` + `svg:size-4`; seleção pintada **só** pelo Highlight (`bg-accent rounded-md` por default, sobrescrevível) — sem `data-[pressed]:bg-*` duplicado. Nomes do upstream (`ToggleGroupItem`, sem alias); **sem** cva (nada usa as variantes).
- **Prova reescrita**: single (Bold/Italic/Underline, `type="single"`) + multiple (`type="multiple"`), como no doc — corrigindo o quirk atual (array sem `type`).
- **Testes trocados**: single (string + `onValueChange`), multiple (array), teclado (roving tabindex por setas) e presença do pill (`data-slot="motion-highlight"`).
- **Docs**: `entries.ts` n=21 (`source: custom-ui/components/toggle-group/`), `review-design` §13 (linha 21) + §14 (dívida quitada), CHANGELOG.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 21 com o primitivo pedido, em prova single+multiple.

## Impact

- Novos: `client/src/components/custom-ui/components/toggle-group/{primitive.tsx,toggle-group.tsx}`, change `custom-ui-toggle-group`.
- Alterados: `catalog-demos.tsx` (prova), `ui-catalog.test.tsx`, `entries.ts` (n=21), `review-design` §13/§14, CHANGELOG.
- **Intocados**: `components/ui/toggle-group.tsx` (base intocada, sem importadores depois), tokens, páginas.

## Non-goals

Manter compat com a API antiga (`ToggleItem`, cva, `multiple?` boolean da Base-UI — a prova e os testes, únicos consumidores, migram); validar o item (fica `pending` até o ok visual).

## Acceptance criteria

1. `/admin/lab/trials` → card `21 ToggleGroup`: single alterna um valor por vez com o pill deslizando; multiple acumula com overlays por item; `disabled` não responde.
2. Teclado: setas movem o foco (roving tabindex do Radix), Espaço/Enter alternam, Esc não faz nada (sem modal).
3. Reduced motion: sem slide do pill nem `whileTap`.
4. Gates: `tsc`, `oxlint`, catálogo e build verdes.
