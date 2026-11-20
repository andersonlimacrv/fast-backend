## Why

Nossa sidebar (`app-sidebar.tsx`, Base-UI, entrega `design-unification`) é funcional mas
mínima: header estático, nav flat, footer só email, sem dropdowns, sem subgroups, sem
breadcrumb, org switcher preso na topbar. O DEMO completo de `Sidebar.md` (AnimateUi:
team switcher, nav colapsável, projects + `...`, user dropdown, breadcrumb) é o modelo
aprovado pelo dono ("adote tudo"). Todo comportamento radix do DEMO tem equivalente
Base-UI — nada de pacote novo.

## What Changes

- **S0 fundamentos:** `ui/dropdown-menu.tsx` (Base-UI Menu) + `ui/breadcrumb.tsx` +
  `ui/separator.tsx` (CSS puros) + `ui/collapsible.tsx` (Base-UI) + `AvatarImage` no
  `Avatar` + ~16 ícones auditados 1-a-1 em `lib/icons.tsx` (equivalente documentado se
  o nome não existir no lucide instalado).
- **S2:** Org Switcher migra topbar → header da sidebar (dropdown real via `switchOrg`;
  "Add" → `/orgs`; topbar mantém badge slug).
- **S3:** Nav em subgroups colapsáveis (Console + Admin; Admin colapsável p/ staff).
- **S4:** Orgs recentes (3 últimas do `AuthContext`) + `...` (View org / View members;
  sem Delete/Share — sem backend).
- **S5:** User dropdown real (Account / Logout / Logout everywhere; sem
  Upgrade/Billing/Notifs — sem feature).
- **S6:** Breadcrumb por rota no content + e2e + ledger §11.
- Tema preservado; tokens em tudo; `lib/icons.tsx` exclusivo; `motion` ≤250ms.

## Capabilities

### New Capabilities

- `sidebar-demo-shell`: team switcher, subgroups, recentes, user dropdown, breadcrumb.
- `menu-primitives`: `dropdown-menu`, `breadcrumb`, `separator`, `collapsible`, `AvatarImage`.

### Modified Capabilities

- `admin-dashboard-shell`: topbar enxuta (sem select de org), sidebar rica.
- `icon-source-of-truth`: +~16 ícones auditados.

## Impact

- `client/src/components/{app-sidebar,ui/dropdown-menu,ui/breadcrumb,ui/separator,ui/collapsible,ui/avatar}.tsx`,
  `layouts/dashboard-layout.tsx`, `pages/*` (breadcrumb), `lib/icons.tsx`, testes, e2e,
  `docs/review-design.md` §11. **Zero `app/`; zero deps novas.**

## Non-goals

- Sidebar radix upstream (só motion patterns); `use-mobile` (matchMedia basta);
  Delete/Share org; Upgrade/Billing/Notifs; TanStack/Recharts; trocar lib de ícones.

## Acceptance criteria

1. Org switcher na sidebar troca `active_org_id` de verdade (mesmo `switchOrg`); topbar sem select.
2. Subgroups colapsam/expandem (mouse + teclado); rail mostra tooltip; drawer `<md` intacto.
3. Dropdowns fecham em `Esc`/outside-click; setas navegam (Base-UI Menu).
4. Breadcrumb reflete a rota (`Orgs / Members`, `Admin / Users`…).
5. Member não vê seção Admin; segurança inalterada (backend autoridade).
6. Gates: vitest + tsc + build + oxlint 0 + e2e full + `lint/types/test-unit` + CHANGELOG.
