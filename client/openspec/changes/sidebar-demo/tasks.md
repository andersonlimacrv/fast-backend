## S0 — Spec (esta change)

- [ ] 0.1 `client/openspec/changes/sidebar-demo/{proposal,tasks,design}.md` + aprovação visual antes de commit

## S1 — Fundamentos (eu)

- [ ] 1.1 `ui/dropdown-menu.tsx` (Base-UI Menu: Trigger/Content/Item/Label/Separator/Shortcut)
- [ ] 1.2 `ui/breadcrumb.tsx` + `ui/separator.tsx` (CSS puros, tokens)
- [ ] 1.3 `ui/collapsible.tsx` (Base-UI Collapsible fino; accordion não serve)
- [ ] 1.4 `Avatar` + `AvatarImage` (foto) com fallback initials
- [ ] 1.5 Auditoria 1-a-1 dos 22 ícones do DEMO → `lib/icons.tsx` (equivalente documentado se faltar)
- [ ] 1.6 Casos no `ui-catalog.test.tsx` (dropdown abre/fecha/Esc; collapsible; breadcrumb)

## S2 — Org Switcher (eu)

- [ ] 2.1 Header da sidebar vira dropdown (orgs do `AuthContext`, ⌘1-9 hint, "Add" → `/orgs`)
- [ ] 2.2 Remove select da topbar (mantém badge slug); single-mode com 1 org esconde switcher
- [ ] 2.3 Teste: troca real de `active_org_id` (mock de contexto, sem rede)

## S3–S5 — Nav + recentes + user (eu)

- [ ] 3.1 Subgroups colapsáveis Console/Admin (chevron rotate, tooltip no rail, teclado)
- [ ] 4.1 Orgs recentes (3) + `...` (View org / View members; sem Delete/Share)
- [ ] 5.1 User dropdown (Account / Logout / Logout everywhere; sem Upgrade/Billing/Notifs)

## S6 — Breadcrumb + verificação (eu)

- [ ] 6.1 Breadcrumb por rota (mapa estático path → trilha; fallback: último segmento)
- [ ] 6.2 e2e: axe + snapshots sidebar nova + 403 intacto + keyboard Tab
- [ ] 6.3 Ledger §11 linha 11: DEMO aplicado; `tasks.md` implementation notes
- [ ] 6.4 Gates full: vitest/tsc/build/oxlint + e2e + `lint/types/test-unit` + CHANGELOG `[Unreleased]`
- [ ] 6.5 **PARAR p/ ok visual do dono — sem commit/PR até lá**

## S7 — Backlog de verificação visual (dono, 2026-09-16, screenshot Orgs)

- [x] 7.1 Footer `UserMenu`: **crash real ao clicar** — `DropdownMenuLabel` usava
  `Menu.GroupLabel`, que exige ancestral `Menu.Group`; ao abrir, o Base-UI lançava
  exceção e desmontava a árvore. Corrigido (label virou `div`, padrão shadcn) +
  `use-mobile` blindado p/ SSR/jsdom + teste de regressão `app-sidebar.test.tsx`
  (abre UserMenu e OrgSwitcher sem desmontar). Truncamento do email segue como
  polish menor no ok visual.
- [x] 7.5 Dropdown radix adotado (pedido do dono): vendored component+primitive
  (+`use-data-state`; checkbox sem referência → skip); `ui/dropdown-menu.tsx`
  deletado; `Group`/ícones/shortcuts/`variant="destructive"`/hover-`Highlight`;
  footer `side="top"`; testes radix com sequência pointer; `aria-selected`
  inválido removido do `HighlightItem` (axe).
- [x] 7.6 `...` dos recentes: **posicionamento quebrado** — radix não aplicava
  translate (motion engolia via asChild); Content/SubContent viraram wrapper radix
  puro + motion interno. **Causa raiz do "..." invisível/inalcançável**: trigger em
  span `display:none` (group-hover) — floating-ui sem rect + fora do Tab. Virou
  opacity-reveal (sempre no DOM, teclado ok), medido ancorado (99,406).
- [x] 7.7 Reframe workspace (dono): grupo "Recent" → **"Workspaces"**; clique na
  linha troca o contexto (`switchOrg`); ativo com Check; `...` mantém View/Members.
- [x] 7.8 Correção E0–E4 (dono): `useIsMobile` com init síncrono (race do toggle);
  landmark `complementary` no Sidebar; `tooltip` nos links (HighlightItem engolia
  handlers do TooltipTrigger — compõe os dois agora); `modal={false}` sempre
  (modal+axe `aria-hidden-focus` + briga com Sheet); contraste hover/open nos
  triggers; `side="right"` no rail (img5); matriz e2e 390/768/1280/1536
  (drawer/Esc/cookie/tooltip/overflow/axe/snapshots); `forceUpdateBounds` removido
  (rAF ilimitado); `aria-selected` fora do HighlightItem.
- [ ] 7.2 Header `OrgSwitcher` com nomes longos (mesma classe de problema do 7.1).
- [ ] 7.3 Rail `md–xl`: tooltips dos subgroups + dropdowns ancorados (side right).
- [ ] 7.4 Drawer `<md`: Sheet foca/fecha, `⌘B` alterna, cookie persiste após reload.

## S8 — Projects group + Organizations subgroups + Settings placeholder (dono, 2026-09-16)

- [x] 8.1 Workspaces removido (duplicava o org switcher do header)
- [x] 8.2 `OrganizationsGroup`: collapsible Base-UI (`render`, `data-panel-open`)
  com as 2 subpastas — All organizations (`/orgs`) + Members (`/orgs/:id/members`
  da org ativa); abre sozinho se a rota atual for `/orgs*`
- [x] 8.3 `ProjectsGroup`: collapsible com `useProjects(activeOrgId)` — count
  sempre visível no trigger (+ tooltip com count no rail), ação `+` New project
  (-> `/projects`, sempre visível fora do rail). Painel em linhas flat padrão
  DEMO/Workspaces (`SidebarMenuButton` + `...` `showOnHover` por projeto com
  View project; rows -> `/projects`, detail route futura), "All projects" +
  "No projects yet"; flat esconde no rail (`group-data-[collapsible=icon]`).
  Minimizado por padrão, aberto persiste em memória (`useState`, sidebar segue
  montada). Tenant-scoped: a lista refaz fetch ao trocar `activeOrgId`.
- [x] 8.4 Account sai da nav flat (footer avatar cobre); gear vira `Settings`
  (`ROUTES.settings` + placeholder em `App.tsx` + breadcrumb; página real futura)
- [x] 8.5 Testes: `app-sidebar.test.tsx` 5/5 (mock `useProjects`); e2e sidebar 4/4
  (3 runs); `tsc+build` ok. Tradeoff registrado: sidebar + ProjectsPage disparam
  2 GET /projects (sem cache compartilhado no `useCollection`) — aceitável no v1.
- [x] 8.6 Collapsible trocado p/ `primitives/radix/collapsible` (vendored do
  registry animate-ui): Base-UI fechava seco (sem exit), upstream tem
  AnimatePresence open+close — era o "efeito diferente". Estrutura DEMO verbatim
  (`asChild` + `group/collapsible` + `data-[state=open]`). Estética DEMO total:
  `SidebarGroupLabel` visíveis (Console/Organizations/Projects/Manage/
  Administration), chevron nas flats, espaçamento do shell. Lição: chevron após
  o label quebra o `truncate` do `span:last-child` do shell — label vaza no rail
  (e2e 1280 acusou); `truncate` explícito nos labels resolve. Row-menus voltaram
  ao `sideOffset` padrão do DEMO (header/footer seguem 24 por pedido).

## S9 — Correções dono (chevron, bg-open, página New, avatar, actions)

- [x] 9.1 Chevron removido das flats (fica só nos triggers colapsáveis, DEMO)
- [x] 9.2 Triggers colapsáveis sem bg de open; destaque fixo só via `isActive`
  (localizado numa subpasta) — regra: open nunca pinta fundo
- [x] 9.3 Página dedicada `/projects/new` (`NewProjectPage` em `pages/Projects.tsx`,
  estética `OrgsPage`: PageHeader + Card form + notify + volta p/ lista;
  `ROUTES.projectNew` + breadcrumb `Projects → New project`)
- [x] 9.4 Mini avatar por projeto: sem slug no backend (`Project` = id/org_id/name
  em `app/modules/projects/models.py:17`) → helper `projectCode(name)` em
  `lib/utils.ts` (4 letras, ex. APOL) na caixinha `bg-sidebar-primary`
- [x] 9.5 `+` virou actions-dropdown (New project -> new page, All projects,
  slot futuro); `...` por linha mantém View project
- [x] 9.6 Testes 8/8 (sidebar 6 + NewProjectPage 2); `tsc+build` ok; e2e 4/4

## Implementation notes (2026-09-16, working tree pré-ok-visual)

- S1–S6 implementados; `tsc`, `vitest` 92/92, `oxlint` 0, `vite build`, e2e 10/10
  (snapshots win32 regenerados; seed linux via workflow na hora da PR).
- Ajustes: `onSelect` radix→`onClick` Base-UI no wrapper; guard `ResizeObserver`
  reaproveitado; `RecentOrgs` sem `<li>` aninhado (axe `listitem`); item
  Organizations readicionado à nav; triggers sem `asChild` (Base-UI usa `render`).
- `impeccable` instalada (C0: pin `0a4e72a`, auditoria, registry); uso como runbook.
- CHANGELOG `[Unreleased]` adicionado (gate release-check).
- Backend intocado: `lint/types/test-unit` verdes por rotina.
- Revisão dono (screenshot): subgroups SEM ícones ruins → ícones sempre; label
  "CONSOLE" removido (chrome sem valor p/ 7+5 itens) → nav flat + separador staff.
  `Collapsible` segue no catálogo p/ disclosures reais.
