## Why

Item **06 CopyButton** da fila do Lab. O componente já vivia em `custom-ui` (sem dívida §14), mas era um porte parcial: embrulhava o `ui/button` num `motion.span` com scale e trocava o ícone com um **fade simples** — sem a assinatura visual do site (`AnimatePresence mode="popLayout"` com `scale + blur`) e sem as variantes/tamanhos quadrados do componente composto.

## What Changes

- **Reescrever `custom-ui/components/copy-button.tsx`** como porte do componente composto `components-buttons-copy`:
  - **cva do site**: variantes `default`/`accent`/`destructive`/`outline`/`secondary`/`ghost`/`link` e tamanhos quadrados `default` (`size-9`), `xs` (`size-7`), `sm` (`size-8`), `lg` (`size-10`);
  - **troca de ícone** com `AnimatePresence mode="popLayout"`: `initial/animate/exit` de `{scale: 0, opacity: 0.4, filter: blur(4px)}` ↔ `{scale: 1, opacity: 1, filter: blur(0px)}`, `0.25s` (reduced-motion zera);
  - `content`, `copied`, `onCopiedChange`, `delay` (3000ms), `hoverScale`/`tapScale` (1.05/0.95) — a API documentada do site;
  - clipboard assíncrono: sucesso → check por `delay`; negação → segue no ícone de copiar (sem `console.error`).
- **Deltas nossos registrados**: foco `ring-2` (DESIGN.md §8; o site usa `ring-[3px]` a 50%), ícones via `lib/icons` (regra de ouro — nada de lucide direto), timer limpo no unmount (o upstream vaza) e `motion.button` simples (o `Slot`/`asChild` do primitive não tem consumidor aqui).
- **Produção preservada**: os usos inline em `admin/Orgs` e `admin/Users` passam a `variant="ghost"` explícito (o default do site é `default`, um botão preenchido — barulhento ao lado de um ID).
- **Prova**: 7 variantes + 4 tamanhos no card 06.
- **Catálogo**: `06` ganha nota do porte; `usedIn` (admin Orgs/Users) inalterado.

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: item 06 passa a ser o porte composto do site.

## Impact

- Alterados: `client/src/components/custom-ui/components/copy-button.tsx` (reescrito), `client/src/components/catalog-demos.tsx` (prova), `client/src/pages/admin/{Orgs,Users}.tsx` (variant explícito), `client/src/lib/catalog/entries.ts`, `docs/review-design.md` §13, `CHANGELOG.md`.
- **Intocados**: `components/ui/**`, backend. O teste existente (`copy-button`) continua verde sem alteração.

## Non-goals

Portar o `primitives-buttons-button` inteiro (o hover/tap vive no nosso `motion.button`); editar `/ui`; validar pelo dono.

## Acceptance criteria

1. `/admin/lab/trials` → card `06`: clicar em qualquer variante troca o ícone com **scale + blur** (0.25s) e volta ao normal após 3s.
2. As 7 variantes e os 4 tamanhos aparecem como no site (botões quadrados).
3. Os usos em Orgs/Users seguem discretos (`variant="ghost"`), sem regressão visual.
4. Teclado: botões focáveis com `ring-2`; `aria-label` alterna "Copy to clipboard"/"Copied" com `aria-live`.
5. Clipboard negado não quebra a UI (segue no ícone de copiar) e não loga segredo/conteúdo.
6. Gates: `tsc`, `oxlint` e o teste do catálogo verdes.
