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

1. `/ui` é a **base shadcn, intocada** — serve de referência/primitivo, nunca é
   editada nem vira dependência direta de página. Componente visual usado por
   página vive em `/custom-ui` (pode compor `/ui` por baixo dos panos), e é de
   lá que as páginas importam (`@/components/custom-ui/...`).
2. Um componente = uma entrada em `custom-ui/components/`: pasta quando há
   2+ arquivos (`<nome>.tsx` estilizado + `primitive.tsx` comportamento —
   ex. `dropdown-menu/`, `sheet/`, `tooltip/`; `sidebar/` em pasta por
   exemplo); arquivo avulso quando camada única (`collapsible.tsx`, `slot.tsx`).
3. Efeito compartilhado vai em `custom-ui/effects/` (hoje: `highlight`).
4. Proibido recriar níveis `primitives/`, `radix/`, `animate/`; imports sempre
   `@/components/custom-ui/...`. Change: `custom-ui-restructure`.
5. Dívida declarada (change `custom-ui-accordion`): alguns arquivos de `/ui`
   ainda carregam customização herdada do `animate-ui-adoption`
   (`accordion`, `alert-dialog`, `checkbox`, `dialog`, `radio`, `tabs`,
   `toggle-group`, `avatar`, `switch`). Convergem 1-a-1: ao validar o item no
   Lab, cria-se a versão `custom-ui` e o catálogo passa a apontar para ela —
   nenhum deles é editado fora de `/custom-ui`.

## Notificações — push vs blocks (change `notify-standard`)

> Guia do agente (contrato, variações do site, onde mora cada coisa, proibido,
> testes): `docs/guides/notify.md`.


1. **Push = mutação + global/sessão, sempre via `notify.*`**
   (`services/notify`, contrato estável). Transiente e auto-dispensável.
   Nunca validação de form (fica inline) nem falha de carga (é do block).
   Mesma falha nunca nos dois canais.
2. **Blocks = contextual persistente**: falha de carga → `ErrorBox` (com
   `actionLabel`/`onAction` para retry); vazio → `EmptyState`; rota →
   `ErrorOne`; escolha bloqueante → `AlertDialog` (nunca toast com ação).
   Todos falam a mesma língua via `friendlyError`.
3. **Lugar**: block específico de página mora em `pages/{page}/blocks/`
   (ex.: `pages/admin/blocks/`); primitivo compartilhado mora em
   `components/` (`feedback.tsx`, `error-state.tsx`) — nada compartilhado
   em `pages/`, nada específico em `components/`.
4. **Costura**: páginas/hooks importam só o contrato (`services/notify` +,
   no JSX, o `AlertDialog`/`ErrorBox`); o provider push mora em
   `services/notify.provider` + visuais do toaster. Trocar a lib de push =
   adapter + visuais, zero página.
