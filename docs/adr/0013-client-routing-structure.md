# ADR 0013: estrutura de pastas do client por rota

## Status

Proposto.

## Contexto

`client/src/pages/` tinha 17 arquivos flat (`Auth.tsx` com 2 páginas,
`Projects.tsx` com página + teste, placeholder no `App.tsx`, gate inline).
Rota e arquivo não se correspondiam; localizar `orgs/:orgId/members` exigia
adivinhar. Docs de usuário são EN+variante; esta convenção é interna (PT-BR,
como `RULES.md`).

## Decisão

Espelhar `ROUTES` em pastas (`:param` → `[param]`), sem `index.tsx`, arquivo
mantendo nome/componente; gate `Protected` extraído para
`layouts/protected-layout.tsx`; regra e mapa em `docs/CLIENT-STRUCTURE.md`.

## Alternativas consideradas

- **Manter flat:** rejeitado (dono; localização por endereço).
- **Full Next App Router (`page.tsx`, layouts aninhados):** rejeitado — migração
  de framework sem ganho funcional.

## Consequências

- Rota nova segue checklist (pasta + `ROUTES` + `App` + breadcrumb + grupo).
- Segmento dinâmico nunca é autoridade (contexto/membership mandam).
- Imports `@/pages/*` só em `App.tsx` e testes (e2e usa URLs, intacto).
