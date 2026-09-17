# CLIENT-STRUCTURE — convenção de pastas do `client/` (PT-BR)

> Convenção interna (como `RULES.md`): `ROUTES` (`src/lib/constants.ts`) é a
> fonte; pasta espelha o endereço. Change: `client-routing-structure`.

## Regra

1. **Pasta = segmentos do endereço.** Ex.: `/admin/users` → `pages/admin/Users.tsx`;
   `/orgs/:orgId/members` → `pages/orgs/[orgId]/Members.tsx` (`:param` vira `[param]`).
2. **Arquivo mantém o nome/componente.** Sem `index.tsx`, sem barrel: imports
   diretos (`@/pages/admin/Users`). Exceções mapeadas: `/`→`landing/`,
   `*`→`not-found/`, `/~`→`overview/` (endereços não-hierárquicos).
3. **Componente de página só em `pages/`.** `App.tsx` só roteia; gates de grupo
   em `layouts/` (`protected-layout.tsx`).
4. **Rota nova =** pasta nova + linha em `ROUTES` + entrada no `App.tsx` +
   breadcrumb em `page-trail.tsx` + grupo de layout declarado.
5. **Autoridade:** segmento dinâmico nunca é autoridade. Páginas derivam contexto
   de `AuthContext` (org ativa) e gates de `RequireStaff`/membership.
   `MembersPage` ignora `:orgId` da URL por desenho.

## Grupos de layout

| Grupo | Layout | Rotas |
|---|---|---|
| Público | nenhum | `/`, `/login`, `/register`, `*` |
| Protegido | `protected-layout` → `dashboard-layout` | todo o resto |

Páginas staff usam ainda `RequireStaff` por dentro.

## Componentes (`components/`)

1. Base shadcn em `/ui`; tudo custom em `/custom-ui` (nunca o inverso).
2. Um componente = uma entrada em `custom-ui/components/`: pasta quando há
   2+ arquivos (`<nome>.tsx` estilizado + `primitive.tsx` comportamento —
   ex. `dropdown-menu/`, `sheet/`, `tooltip/`; `sidebar/` em pasta por
   exemplo); arquivo avulso quando camada única (`collapsible.tsx`, `slot.tsx`).
3. Efeito compartilhado vai em `custom-ui/effects/` (hoje: `highlight`).
4. Proibido recriar níveis `primitives/`, `radix/`, `animate/`; imports sempre
   `@/components/custom-ui/...`. Change: `custom-ui-restructure`.
