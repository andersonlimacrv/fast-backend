## Why

23 docs em `references/components_to_use/` precisam virar portas 1-a-1 com
decisão do dono, rebatendo `DESIGN.md` + `CLIENT-STRUCTURE.md` + `review-design.md`
+ skills de frontend. Falta o banco de prova: a Gallery mostra o já-adotado;
o playground testa o novo (página `components` + página `blocks`).

## What Changes

- Rotas staff `/playground`, `/playground/components`, `/playground/blocks`
  (`pages/playground/`, item na sidebar Admin, breadcrumb).
- Índice com a fila de 23 docs e status (aplicado/pendente/descartado...);
  `components/` recebe as demos vivas item a item; `blocks/` começa placeholder.
- Fila alfabética (decisão do dono); cada item: ficha + decisão + porte + ledger.

## Capabilities

### New Capabilities

- `playground-harness`: páginas staff de prova 1-a-1 (components + blocks).

## Impact

- `ROUTES`, `App`, breadcrumb, sidebar Admin, `pages/playground/`.
  Zero `app/`; zero deps novas (`FlaskConical` entra via `lib/icons`, canal oficial).

## Non-goals

- Portar qualquer componente nesta change (cada porte é sua decisão+tarefa);
  mexer na Gallery; commit sem pedido.

## Acceptance criteria

1. Staff vê Playground na sidebar; anônimo recebe 403/redirect (RequireStaff).
2. Breadcrumb `Playground(/components|/blocks)`; trail sem overflow no 390px.
3. `tsc`, vitest, e2e, `oxlint` verdes; apresentado antes dos gates.
