## Why

Os 23 docs de `references/components_to_use/` precisam de um funil explícito: **provar** (incubar) e **usar de verdade** (catálogo). Faltava (a) separar esses dois papéis com nomes que os expliquem, (b) uma **fonte única** de numeração/classificação/status — hoje espalhada na página, impossível de manter consistente entre as telas, e (c) mostrar, no catálogo, **onde cada componente é realmente usado**, para identificá-lo de relance.

Decisões do dono (2026-09-19): catálogo validado é `/admin/gallery`; oficina é `/admin/lab` (+ `/admin/lab/trials`); a classificação é `component`/`block` (com tipo); a numeração e a lista vivem em `/lib`; novos componentes chegam pelos docs em `references/`.

## What Changes

- **`lib/catalog/`** (types + entries + helpers): 23 entradas — uma por doc de `references/components_to_use/` — com `n` estável, `class` (component|block), `kind`, `status` (pending|validated|dropped), `ref`/`refGroup`, `source`, `usedIn[]`.
- **`/admin/lab`**: lista de adoção separada em Components/Blocks (n, tipo, status, arquivo).
- **`/admin/lab/trials`**: provas vivas dos `pending` (registro compartilhado `components/catalog-demos.tsx`).
- **`/admin/gallery`**: só `validated`, separado em Components/Blocks, com prova + `usedIn` (link rápido quando há rota, senão descrição em texto).
- Rotas antigas `/playground*` e `/admin/components` deixam de existir; `/admin/lab/blocks` é absorvido (blocks é classe, não rota).
- Ledger `review-design` atualizado (§12 nota de rename, §13 modelo do catálogo).

## Capabilities

### New Capabilities

- `lab-harness`: catálogo em `lib/`, lista de adoção, provas e catálogo validado (staff).

### Modified Capabilities

- Nenhuma.

## Impact

- Novos: `client/src/lib/catalog/{types,entries,index}.ts`, `client/src/components/catalog-demos.tsx`, `client/src/components/catalog-meta.tsx`, `client/src/pages/admin/lab/{Lab,Trials}.tsx`, `client/src/pages/admin/gallery/Gallery.tsx`.
- Removidos: `pages/admin/Components.tsx`, `pages/admin/lab/Blocks.tsx`, `LAB_QUEUE` inline.
- Alterados: `ROUTES`, `App.tsx`, `app-sidebar.tsx`, `page-trail.tsx`, `client/e2e/auth.spec.ts`.
- Zero `app/`; zero deps novas.

## Non-goals

Portar componentes novos (cada item é sua própria change `lab-<slug>`); mexer em `references/`; commit sem pedido.

## Acceptance criteria

1. `/admin/lab` lista os 23 itens em Components/Blocks com `n`, tipo e status; `validated` só `404PageNotFound`.
2. `/admin/lab/trials` prova os `pending` (prova viva quando existe; "no live proof yet" quando não).
3. `/admin/gallery` mostra só validados, com prova e `usedIn` (`/admin/lab`/`/admin/gallery` na sidebar Admin).
4. Numeração idêntica nas duas telas (mesma fonte `lib/catalog`).
5. Gates quando pedidos: `tsc+build`, vitest, e2e, `oxlint`.
