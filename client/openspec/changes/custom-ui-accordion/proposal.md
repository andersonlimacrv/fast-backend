## Why

Duas coisas (dono, 2026-09-19) que se resolvem juntas:

1. **Regra de camadas**: `/ui` é a **base shadcn intocada** — só referência/primitivo. O componente visual que a página usa mora em `/custom-ui` (pode compor a base por baixo). Isso estava implícito em `CLIENT-STRUCTURE.md`, mas o `animate-ui-adoption` tinha reconciliado motion **dentro** de `/ui` (9 arquivos), e o item 02 (Accordion) apontava para um deles.
2. **Padrão visual do accordion**: o dono quer o comportamento da sidebar — o `Collapsible` vendored (radix + `AnimatePresence`) que **fecha animado**. O `ui/accordion` desmonta o painel no fechamento (só a abertura anima), o mesmo defeito que motivou a troca em S8.6.

Além disso, o `Collapsible` está em produção (grupos da sidebar) e **não constava do catálogo**.

## What Changes

- **Novo `custom-ui/components/accordion.tsx`** sobre `custom-ui/components/collapsible.tsx`: `Accordion` (single; `multiple` opcional; controlado ou `defaultValue`), `AccordionItem`, `AccordionTrigger` (chevron sempre visível, gira no aberto), `AccordionContent` (`keepRendered`). Abre **e fecha** com animação; reduced-motion respeitado. Nada de `/ui`.
- **Catálogo**: `02 Accordion` passa a apontar `source: custom-ui/components/accordion.tsx`; nova entrada **`24 Collapsible`** (`component`/`base`, `status: pending`, `ref: AnimateUi/Sidebar.md`, `usedIn` = shell/sidebar).
- **Prova do 02** (registro de demos) passa a usar o accordion novo: single + `multiple` + `keepRendered`.
- **Docs**: `CLIENT-STRUCTURE.md` §Componentes com a regra explícita + a dívida declarada; espelho em `ARCHITECTURE.md` (+pt-BR); `review-design.md` §14 (tabela da dívida) e §13 atualizado (02 e 24).

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: primeiro componente `custom-ui` próprio consumido pela prova; catálogo com 24 entradas.

## Impact

- Novos: `client/src/components/custom-ui/components/accordion.tsx`, change `custom-ui-accordion`.
- Alterados: `lib/catalog/entries.ts`, `components/catalog-demos.tsx`, `docs/CLIENT-STRUCTURE.md`, `docs/ARCHITECTURE.md` (+pt-BR), `docs/review-design.md`, `CHANGELOG.md`.
- **Intocados**: tudo em `components/ui/**` (base shadcn).

## Non-goals

Editar/mover arquivos de `/ui` (dívida declarada, convergência 1-a-1 na validação); validar o item 02 (é o dono); portar outros itens.

## Acceptance criteria

1. `/admin/lab/trials` mostra o card `02 Accordion` com single, `multiple` e `keepRendered`, **fechando animado** (mesma sensação dos grupos da sidebar).
2. `/admin/lab` lista `24 Collapsible` como `pending`, com `usedIn` = shell.
3. `source` do 02 aponta `custom-ui/components/accordion.tsx`; nenhuma página importa `@/components/ui/accordion`.
4. `docs/CLIENT-STRUCTURE.md` tem a regra e a dívida; `ARCHITECTURE` espelha.
5. Gates quando pedidos: `tsc+build`, vitest, e2e, `oxlint`.
