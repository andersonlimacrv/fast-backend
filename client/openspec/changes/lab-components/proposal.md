## Why

Primeiro item da fila validado 1-a-1 pelo dono. `404PageNotFound` é o único `validated` hoje: sem doc-fonte próprio em `references/` (só o layout `ExempleLayours.md/404PageNotFound.md`), já portado como `ErrorOne` e em produção na rota `*` — o dono validou o visual em 2026-09-19. O `Accordion` é o segundo: doc-fonte + primitivo reconciliado (`ui/accordion.tsx`, Lane C do `animate-ui-adoption`), com prova viva pronta no Lab aguardando validação.

## What Changes

- `404PageNotFound`: `status: "validated"` no catálogo + prova compacta (`ErrorOne`) no registro de demos + `usedIn` ("Catch-all (`*`) — NotFound page").
- `Accordion`: prova viva (single + `multiple` + `keepRendered`, dados neutros) sobre o porte próprio em `custom-ui` (change `custom-ui-accordion`); `status` segue `pending` até o ok do dono.
- Ledger `review-design` §13 atualizado com o modelo do catálogo.

## Capabilities

### New Capabilities

- Nenhuma (`lab-harness` cobre o harness).

### Modified Capabilities

- `lab-harness`: primeira entrada validada + primeira prova viva.

## Impact

- Alterados: `client/src/lib/catalog/entries.ts`, `client/src/components/catalog-demos.tsx`, `docs/review-design.md` (§13), `CHANGELOG.md`.
- Zero `app/`; zero deps novas.

## Non-goals

Validar o `Accordion` por conta própria (é o dono quem valida); portar itens novos; commit sem pedido.

## Acceptance criteria

1. `/admin/gallery` mostra `01 · 404PageNotFound` (block) com a prova e o `usedIn`.
2. `/admin/lab` mostra `01` como `validated` e `02 Accordion` como `pending`, com a mesma numeração.
3. `/admin/lab/trials` exibe a prova do Accordion (single + multiple).
4. Gates quando pedidos: `tsc+build`, vitest, e2e, `oxlint`.
