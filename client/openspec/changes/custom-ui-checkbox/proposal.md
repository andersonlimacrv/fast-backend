## Why

Item **05 Checkbox** da fila do Lab. O `source` apontava para `ui/checkbox.tsx` — um dos arquivos com customização herdada em `/ui` (dívida §14), contra a regra de camadas (componente visual de página vive em `/custom-ui`; `/ui` é base intocada).

Além da convergência, o porte antigo **não** tinha o comportamento do upstream (`primitives-base-checkbox`): o raiz não escalava em hover/tap e o indicador fazia um fade+scale em vez do **desenho do check** (`pathLength`), sem suporte a `indeterminate`.

## What Changes

- **Novo `custom-ui/components/checkbox.tsx`**, portando o **componente composto** do site (`components-base-checkbox`) sobre o primitive:
  - **estética por `cva`** (é o que o dono pediu ao rejeitar a primeira tentativa): caixa `size-5` (sm `size-4.5 rounded-[5px]`, lg `size-6 rounded-[7px]`), `variant` `default` = `bg-background border` vs `accent` = `bg-input`, marcado/indeterminado com `bg-primary` + `text-primary-foreground`, `transition-colors duration-500`, indicador `size-3.5`/`size-3`/`size-4`;
  - **o próprio componente renderiza o indicador** (children primeiro): `<Checkbox aria-label="…" />` sozinho é o uso normal — a API do primitive com `<CheckboxIndicator />` como filho continua disponível para composição;
  - comportamento do primitive: contexto + Root como `motion.button` (`whileHover` 1.05 / `whileTap` 0.95) e check desenhado por `pathLength` (0.2s, +0.2s de delay) ou linha em `indeterminate`.
- **Deltas nossos**: `ring-2` de foco (DESIGN.md §8 — o site usa `ring-[3px]` + offset) e `prefers-reduced-motion` zerando escalas e desenho.
- **Catálogo**: `05 source` → `custom-ui/components/checkbox.tsx` + nota.
- **Prova**: seis variantes (default marcado, accent, sm, lg, indeterminate, disabled).
- **Testes**: `ui-catalog.test.tsx` ganha um bloco `custom-ui checkbox` (toggle por clique com `aria-checked` e presença do indicador; `aria-checked="mixed"` em `indeterminate`).

## Capabilities

### New Capabilities

- Nenhuma (reforça `lab-harness`).

### Modified Capabilities

- `lab-harness`: item 05 convergido para `custom-ui` (dívida §14 reduzida em 1) com o comportamento do upstream.

## Impact

- Novos: `client/src/components/custom-ui/components/checkbox.tsx`, change `custom-ui-checkbox`.
- Alterados: `client/src/components/catalog-demos.tsx` (import + prova), `client/src/lib/catalog/entries.ts`, `client/src/components/ui/ui-catalog.test.tsx` (+2 casos), `docs/review-design.md` (§13/§14), `CHANGELOG.md`.
- **Intocados**: `components/ui/**`.

## Non-goals

Editar/mover `/ui`; validar o item (dono); portar outros itens.

## Acceptance criteria

1. `/admin/lab/trials` → card `05`: ao marcar, o **check se desenha** (não aparece pronto) e o box dá um leve scale no hover e no clique.
2. `indeterminate` mostra a linha; `accent` usa o token `accent`; `sm`/`lg` mudam o tamanho do box e do ícone.
3. Teclado: o box é um botão focável (Tab), alterna com Espaço, com `ring-2` visível; `aria-checked` reflete o estado (`mixed` no indeterminate).
4. `prefers-reduced-motion`: sem scale e sem desenho animado.
5. Gates: `tsc`, `oxlint` e o teste do catálogo verdes.
