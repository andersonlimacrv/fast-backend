## Why

O `client/` hoje é um monólito `header-nav` (`client/src/App.tsx`, `client/src/components/layout.tsx:71-152`):
sem sidebar, sem layout de dashboard, tabela estática sem sort/filter (`client/src/components/ui/table.tsx`),
sem tipografia dedicada (system fonts) e com metade dos primitivos de `references/components_to_use/`
já existindo em versão anterior (`ui/accordion.tsx`, `ui/alert-dialog.tsx`, `ui/checkbox.tsx`,
`ui/copy-button.tsx`, `ui/radio.tsx`, `ui/tooltip.tsx`, `ui/avatar.tsx`, `ui/kpi-card.tsx`).
Ícones hoje são só `lucide-react` (7 arquivos em `src/`, `client/components.json:20`), mas os
componentes de referência pedem `react-icons/*` em 5 docs — sem regra de centralização, cada
incorporação futura espalharia imports e SVGs pelo código, inviabilizando troca de lib.
O objetivo é transformar o admin num dashboard moderno (mobile-first, sidebar obrigatória,
transições sutis 120–250ms, `prefers-reduced-motion`), **preservando** chaves do tema atual
(lima `oklch(0.8487 0.2181 127.80)`, `--radius: 0rem`, charts monocromáticos, `tweakcn opencode_AC_VARIATION`).

## What Changes

- **F1 — fundação:** `client/src/lib/icons.tsx` (fonte única de ícones + SVGs; re-exporta
  `lucide-react` + `react-icons@5.7.0` pinado; ban de imports diretos fora dele) +
  `components/app-sidebar.tsx` + `layouts/dashboard-layout.tsx` (drawer `<md`, rail `md–xl`,
  expandida `>xl`, preferência em cookie — `docs/DESIGN.md §6`) + rotas admin aninhadas sob o layout.
- **F2 — upgrades de primitivos:** `dialog`, `alert-dialog`, `tabs`, `floating-input` (novo,
  `ui/floating-input.tsx`), `checkbox`, `radio`, `toggle-group` (novo), `avatar`, `copy-button`,
  `circular-progress` (novo) — todos sobre `@base-ui/react@1.8.0` + `motion@13.3.0` + tokens
  `var(--color-*)`, sem hardcodes (`zinc`/hex das variantes de referência são reescritos).
- **F3 — componentes portados:** `theme-toggle` (substitui `Moon/Sun` de `layout.tsx:1`, usa
  `external/theme.ts` existente em vez de `next-themes`), `NotFound` (layout `ErrorOne`),
  `file-uploader`, `credit-usage-card`, `run-action-button` (só `lucide Zap`, sem `react-icons/*`
  internos — o arquivo consome via `lib/icons.tsx`), `gooey-menu` (escopo restrito: debug overlay).
- **F4 — tokens e a11y:** tipografia `DESIGN.md §4.3` (`Inter Variable` + `JetBrains Mono Variable`
  via fontsource pinado), revisão fina de espaçamentos (`--row-gap`), `prefers-reduced-motion`,
  foco `ring` visível, `aria-live` em KPIs, `axe` sem violações serious.
- **Descartado:** `ExempleLayours/DeplymentCard.md` (duplicata do `RunActionButton`).
- **Spec futura (fora desta change):** `ExpandDetails`, `FileTree`, `SubsriptionCalendar`,
  TanStack Table/Query, Recharts/Tremor, virtualização.

## Capabilities

### New Capabilities

- `admin-dashboard-shell`: sidebar responsiva + `DashboardLayout` + layouts reutilizáveis
  (`PageHeader`, `KpiGrid`, `CrudPage`, `SettingsTabs`, `EmptyState/ErrorState`).
- `icon-source-of-truth`: `lib/icons.tsx` como única fonte de ícones e SVGs (regra de ouro).
- `themed-typography`: fontes `DESIGN.md §4.3` como tokens (`--font-sans/--font-mono`).

### Modified Capabilities

- `client-primitives`: upgrades de `dialog/alert/tabs/checkbox/radio/avatar/copy` + novos
  `floating-input/toggle-group/circular-progress/file-uploader/run-action-button/gooey-menu`.
- `client-theming`: tipografia + espaçamentos finos (cores/radius preservados).
- `client-a11y`: `prefers-reduced-motion`, foco, `aria-live`, gate `axe`.

## Impact

- `client/src/{lib/icons.tsx,components/app-sidebar.tsx,layouts/*,components/ui/*,pages/*,index.css}`,
  `client/package.json` (+`react-icons@5.7.0`, 2 pacotes fontsource pinados), `client/e2e/*`
  (snapshots admin), `docs/review-design.md` (final). **Nenhum arquivo `app/` tocado.**
- Autoridade continua no backend: `Protected=user?` + `RequireStaff` UX-gate + `403` real;
  sidebar só reflete `is_staff/isRoot` (`services/admin.ts:60-66`).

## Non-goals

- TanStack Table/Query, Recharts/Tremor/ECharts, virtualização (change futura com server-side real).
- Mudança de cores, `--radius`, chave do tema tweakcn; modo claro/escuro já existe (`external/theme.ts`).
- `ExpandDetails`, `FileTree`, `SubsriptionCalendar` (spec futura — ver `design.md` § Dívida).
- Backend: nenhuma migração, endpoint ou policy; se faltar dado para algum card, change backend separada.
- Novas skills: só runbooks instalados (`vercel-react-best-practices`, `web-design-guidelines`).

## Acceptance criteria

1. `lib/icons.tsx` existe; `grep -r "from \"lucide-react\"|from \"react-icons" client/src --include="*.tsx" -l`
   lista **só** `lib/icons.tsx`; `react-icons` ausente do bundle fora dele.
2. Sidebar comporta-se como `DESIGN.md §6` (drawer `<md`, rail `md–xl`, expandida `>xl`, cookie persiste).
3. Todos os itens §2.1 do plano entram renderizando sob tokens (`bg-card/border-border/...`),
   sem hex/`zinc` hardcoded (`grep -ri "zinc\|#[0-9a-f]\{6\}"` nos novos arquivos → zero, salvo `alt`/comentário).
4. Member recebe `403` em `/admin*`; staff vê seção Admin; root vê ações root (e2e cobre).
5. `vitest run` + `tsc -b && vite build` + `oxlint` + `playwright` (chromium, `reducedMotion:reduce`)
   verdes; `axe` sem serious; snapshots `admin-overview|admin-users|login|not-found` atualizados.
6. Mobile 360px sem overflow horizontal; tabelas colapsam p/ 2–3 colunas + detalhe expansível.
7. PR única `feat/client-design-unification` → release **minor** (tag + CHANGELOG curado).
