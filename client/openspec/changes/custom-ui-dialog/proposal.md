# custom-ui-dialog — proposal

## Why

O item 09 do catálogo (`Dialog.md`, animate-ui `components-base-dialog`) está `pending` e o único consumidor é a **prova do lab** (`catalog-demos.tsx`), que importa de `@/components/ui/dialog` — a base em `/ui` com motion embutido, listada na **dívida §14** ("`dialog.tsx` | + motion/spring | prova do 09"). O diálogo é ainda a única peça de overlay que **não** tem porte próprio em `/custom-ui`, enquanto o irmão destrutivo (03 `AlertDialog`) já foi portado e validado com flip, blur, `AnimatePresence` nos dois sentidos e `from` com default `bottom` (DESIGN.md §7).

O doc do 09 pede o **componente composto** (`components-base-dialog` sobre `primitives-base-dialog`), com `from` (`top|bottom|left|right`), `showCloseButton` (default `true`, botão X com "Close" sr-only) e um conjunto de classes de layout próprias — nada disso existe na base `/ui` atual (que não tem botão de fechar e anima com um wrapper `scale/y`, não o flip).

## What Changes

- **Novo `custom-ui/components/dialog.tsx`** — porte do composto do doc sobre a coreografia do primitivo (mesma arquitetura validada do 03):
  - `Dialog` (contexto + `useControlledState`), `DialogTrigger`, `DialogClose`, `DialogPortal` (portal gated por `AnimatePresence` com `keepMounted` — **entrada e saída** animadas), `DialogOverlay` (backdrop com fade 0.15s `easeInOut` + `backdrop-blur-sm`);
  - **`DialogContent`** (o `DialogPopup` do doc) com **`from`** (`top|bottom|left|right`) fazendo flip 3D (`perspective(500px)` + `rotateX|rotateY`, `scale 0.8→1`, blur 4px) com spring **500/32** (upstream 150/25; token do dono ~0.25s, faixa do DESIGN.md §7) e **`showCloseButton`** (default `true` → botão X com `<span className="sr-only">Close</span>`, `ring-2` de foco per §8);
  - **layout copiado do 03 `AlertDialog`** (dono, 2026-09-23: consistência visual): painel `w-full max-w-md rounded-lg border p-6 shadow-lg`, header `mb-4 gap-1.5`, título `text-lg font-bold tracking-tight`, descrição `text-sm text-muted-foreground`, footer `mt-5 flex-col-reverse gap-2 sm:flex-row sm:justify-end` — o que o 09 tem de próprio é o `showCloseButton` e o `from`/flip;
  - `from` entra de **`bottom`** por default — convenção global de overlays do app (DESIGN.md §7, diretriz 6);
  - superfície `bg-card text-card-foreground` (como o 03), ícones via `lib/icons`, reduced-motion colapsa tudo para instantâneo.
  - **Prova do lab atualizada**: `catalog-demos.tsx` passa a importar do `custom-ui` e ganha a demo do doc (form "Edit profile" com `Input`s + footer Salvar/Cancelar) como **default** (1º diálogo, `from=bottom`) + variantes **rotuladas** `variant: from="top"` e `variant: showCloseButton=false` (a pedido do dono, para não confundir variante com default).
- **Catálogo**: `09 Dialog` com `source: "custom-ui/components/dialog.tsx"` (dívida §14 −1: a base `/ui/dialog.tsx` fica intocada e sem importadores).
- **Testes**: +2 casos do porte (abre pelo trigger e fecha pelo X; `showCloseButton={false}` fecha pelo `DialogClose`), 37/37 no catálogo.

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: item 09 com porte próprio em `/custom-ui` e prova atualizada.

## Impact

- Novos: `client/src/components/custom-ui/components/dialog.tsx`, change `custom-ui-dialog`.
- Alterados: `catalog-demos.tsx` (prova do 09), `ui-catalog.test.tsx` (+2), `client/src/lib/catalog/entries.ts` (n=9), `docs/review-design.md` §13/§14, `CHANGELOG.md`.
- **Intocados**: `components/ui/**` (a base segue; o `/ui/dialog.tsx` só perde o último importador — a prova), tokens do tema e o `theme-toggle`.

## Non-goals

Migrar consumidores de produção (não há nenhum hoje — só a prova do lab); mexer no `Dialog.Body`/scroll interno (o doc não expõe); mudar o `AlertDialog` (03).

## Acceptance criteria

1. `/admin/lab/trials` → card `09 Dialog`: abre pelo trigger; o painel flipa de baixo para cima (default), com blur/scale de entrada; fecha pelo X (default), pelo `DialogClose` (Cancelar) e por Esc/clique no backdrop; a variante rotulada `variant: from="top"` flipa de cima; `variant: showCloseButton=false` esconde o X.
2. A demo do doc (form "Edit profile" com Name/Username + Salvar/Cancelar) renderiza com o layout do 03 (painel `max-w-md`, header/título/footer do AlertDialog) — a consistência pedida pelo dono.
3. Teclado: Esc fecha, o foco entra no painel e volta ao trigger no fim; X e `DialogClose` são focáveis com `ring-2` visível.
4. Reduced motion: sem flip/blur (entrada e saída instantâneas).
5. Gates: `tsc`, `oxlint` e o teste do catálogo verdes.
