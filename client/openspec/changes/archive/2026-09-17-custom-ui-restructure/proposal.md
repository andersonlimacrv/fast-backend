## Why

`components/animate-ui/` tem dois eixos redundantes (`components/` × `primitives/`
× `radix/` × `animate/`): `dropdown-menu`, `sheet` e `tooltip` existem nos dois
níveis e ambos os lados são usados (o component importa o primitive em cada
par). Ninguém sabe onde criar o próximo arquivo. O dono definiu: base shadcn
em `/ui`, custom em `/custom-ui/components` (pasta por componente), efeitos
compartilhados em `/custom-ui/effects/`.

## What Changes

- `animate-ui/` → `custom-ui/`: pares duplicados viram pasta por componente
  (`dropdown-menu/`, `sheet/`, `tooltip/` com `*.tsx` estilizado + `primitive.tsx`;
  `sidebar/` em pasta pelo exemplo do dono); camada única fica avulsa
  (`collapsible.tsx`, `slot.tsx`); `highlight` vai p/ `effects/`.
- Remap mecânico de imports (só paths, zero lógica) + regra em
  `docs/CLIENT-STRUCTURE.md`. Proibido recriar nível `primitives/`.

## Capabilities

### New Capabilities

- `custom-ui-convention`: base `/ui`, custom por pasta, effects compartilhados.

## Impact

- `client/src/components/custom-ui/`, ~12 imports, 1 seção de docs.
  Zero `app/`; zero deps; zero visual/comportamento (e2e deve passar sem regen).

## Non-goals

- Mudar comportamento/estilo de qualquer componente; tocar em `/ui`;
  novos componentes; commit sem pedido.

## Acceptance criteria

1. Nenhum import `@/components/animate-ui` restante; pasta some da árvore.
2. `tsc`, vitest 102/102, e2e full verde sem regen, `oxlint` sem erros.
3. Regra documentada; apresentada antes de qualquer commit.
