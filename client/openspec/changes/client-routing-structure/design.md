# client-routing-structure — design

## Mapa rota → pasta → layout (`ROUTES` em `lib/constants.ts` é a fonte)

| Rota | Pasta/arquivo | Layout |
|---|---|---|
| `/` | `pages/landing/Landing.tsx` | nenhum (pública) |
| `/login`, `/register` | `pages/auth/Login.tsx`, `pages/auth/Register.tsx` | nenhum (pública) |
| `*` | `pages/not-found/NotFound.tsx` | nenhum (pública) |
| `/~` | `pages/overview/Dashboard.tsx` | protegido+dashboard (exceção: `~` não vira pasta) |
| `/health`, `/account`, `/grants`, `/audit` | `pages/<segmento>/<Nome>.tsx` | protegido+dashboard |
| `/settings` | `pages/settings/Settings.tsx` | protegido+dashboard |
| `/orgs` | `pages/orgs/Orgs.tsx` | protegido+dashboard |
| `/orgs/:orgId/members` | `pages/orgs/[orgId]/Members.tsx` | protegido+dashboard |
| `/projects`, `/projects/new` | `pages/projects/Projects.tsx` (`ProjectsPage` + `NewProjectPage`, mesmo arquivo) | protegido+dashboard |
| `/admin/*` | `pages/admin/*.tsx` (Overview, Users, Orgs, Audit, Gallery) | protegido+dashboard + `RequireStaff` |

## Regras (vão p/ `docs/CLIENT-STRUCTURE.md`)

1. Pasta = segmentos do endereço; `:param` → `[param]`; sem `index.tsx`/barrel.
2. Arquivo mantém nome/componente atual; rota nova = pasta nova + linha em
   `ROUTES` + entrada no `App.tsx` + breadcrumb em `page-trail.tsx`.
3. Componente de página só em `pages/`; `App.tsx` só roteia.
4. **Autoridade**: segmento dinâmico nunca é autoridade — páginas derivam
   contexto de `AuthContext` (org ativa) e gates de `RequireStaff`/membership.
   `MembersPage` ignora `:orgId` da URL por desenho (verificado na S4).
5. Layout por grupo (tabela acima); página nova declara grupo na change.

## Alternativas consideradas

- Manter flat: rejeitado (dono; localização por endereço).
- Full Next App Router (`page.tsx`, layouts aninhados): rejeitado — migração de
  framework sem ganho funcional; `protected-layout.tsx` extrai o gate sem reescrever.
