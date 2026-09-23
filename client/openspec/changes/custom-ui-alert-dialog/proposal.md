## Why

Item **03 AlertDialog** da fila do Lab. O `source` apontava para `ui/alert-dialog.tsx` — um dos 9 arquivos com customização herdada em `/ui` (dívida §14): a regra de camadas (dono, 2026-09-19) diz que o componente visual consumido por página vive em `/custom-ui`, e `/ui` é base intocada.

Além disso, o porte atual só anima a **entrada** (spring + scale, sem exit e sem animação do backdrop). O primitivo upstream (`primitives-base-alert-dialog`) tem coreografia bem mais rica: backdrop com blur, popup com **flip 3D** (`perspective` + `rotateX|rotateY` conforme a direção `from`) e ambos com **exit**.

## What Changes

- **Novo `custom-ui/components/alert-dialog.tsx`** — porte fiel ao upstream sobre o mesmo primitivo Base UI, nos nossos tokens:
  - Root com contexto (`useControlledState`) e Portal gated por `AnimatePresence` + `keepMounted` → **entra e sai** animado nos dois casos.
  - `AlertDialogOverlay` (backdrop): `opacity` + `blur(4px→0)`, `0.2s easeInOut`, com exit.
  - `AlertDialogContent`: popup com `render={<motion.div/>}` — `perspective(500px)` + `rotateX|rotateY(±20deg)` + `scale(0.8→1)` + blur, spring `500/32` (~0.25s) com exit; prop `from` (`top|bottom|left|right`, default `top`).
  - Centralização via `AlertDialog.Viewport` (flex) — sem `translate` do Tailwind brigando com o `transform` do motion.
  - `Header/Footer/Title/Description/Action/Cancel` mantidos (mesmos nomes/estilo; Action/Cancel seguem `AlertDialog.Close`).
  - Reduced motion colapsa tudo para instantâneo.
- **Catálogo**: `03 AlertDialog` → `source: custom-ui/components/alert-dialog.tsx` + nota do delta.
- **Prova**: o card 03 no registro de demos passa a importar do `custom-ui` (mesma demo de confirmação destrutiva), com um segundo gatilho `from="bottom"` para comparar a direção do flip.

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: item 03 convergido para `custom-ui` (dívida §14 reduzida em 1).

## Impact

- Novos: `client/src/components/custom-ui/components/alert-dialog.tsx`, change `custom-ui-alert-dialog`.
- Alterados: `lib/catalog/entries.ts`, `components/catalog-demos.tsx`, `docs/review-design.md` (§13/§14), `CHANGELOG.md`.
- **Intocados**: `components/ui/**` (base shadcn; o arquivo antigo fica como base, sem consumo).

## Non-goals

Editar/mover `/ui`; validar o item (dono); portar outros itens da dívida.

## Acceptance criteria

1. `/admin/lab/trials` → card `03 AlertDialog` abre com backdrop desfocado e popup em flip 3D, e **fecha** com a animação inversa (antes só a entrada animava).
2. Gatilho `from="bottom"` flipa de baixo (rotateX positivo) para comparar.
3. Teclado: gatilho focável, `Esc`/Cancelar/Confirmar fecham com foco devolvido ao gatilho.
4. Reduced motion: sem flip/blur (instantâneo).
5. Gates quando pedidos: `tsc+build`, vitest, e2e, `oxlint`.
