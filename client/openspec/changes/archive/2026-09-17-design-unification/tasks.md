## F1 — Fundação: ícones + sidebar + layout (bloqueia F2/F3)

- [x] 1.1 `client/package.json`: adicionar `react-icons@5.7.0` (pin exato),
  `@fontsource-variable/inter@5.3.0`, `@fontsource-variable/jetbrains-mono@5.3.0` (pins exatos);
  `npm install` + `vite build` verde
- [x] 1.2 Criar `client/src/lib/icons.tsx`: re-exporta subconjunto usado de `lucide-react`
  + subset `react-icons/{ri,fa6}` necessário a `gooey-menu/run-action-button/file-uploader`;
  todo SVG inline do projeto vira componente exportado dali; documentar regra de ouro no header
- [x] 1.3 Migrar os 7 arquivos atuais com import direto (`layout.tsx`, `login-modal.tsx`,
  `ui/accordion.tsx`, `pages/NotFound.tsx`, `ui/copy-button.tsx`, `ui/kpi-card.tsx`,
  `ui/toaster.tsx`) para importar de `@/lib/icons`
- [x] 1.4 Criar `client/src/components/app-sidebar.tsx` (Provider/Header/Content/Group/Menu/Footer/Rail,
  tokens `sidebar`, sobre `@base-ui/react@1.8.0` — **sem** `animate-ui`/Radix novo)
- [x] 1.5 Criar `client/src/layouts/dashboard-layout.tsx` (grid + `@container`,
  drawer `<md` via sheet, rail `md–xl`, expandida `>xl`, preferência em cookie;
  topbar com `theme-toggle` + `avatar` + density switch)
- [x] 1.6 Aninhar rotas em `client/src/App.tsx` sob `DashboardLayout` (protegidas) e manter
  `Landing/Auth/NotFound` fora; `RequireStaff` continua nas páginas (sem `role` no router)
- [x] 1.7 Seção Admin na sidebar só se `is_staff||is_superuser` (espelha `layout.tsx:93`);
  `grep` garante zero import direto de icon libs fora de `lib/icons.tsx`

## F2 — Primitivos (upgrade + novos, todos Base-UI + motion + tokens)

- [x] 2.1 `ui/dialog.tsx`: auditar existente × `references/.../Dialog.md`; Header/Title/Desc/Footer p/ CRUD
- [x] 2.2 `ui/alert-dialog.tsx`: upgrade p/ delete user/org (ação destrutiva + confirmação digitada se root)
- [x] 2.3 `ui/tabs.tsx`: upgrade (settings, detalhe user/org; `auto-height`)
- [x] 2.4 `ui/floating-input.tsx` (novo, de `Inputs.md`; **remover** `motion` declarado e não usado)
- [x] 2.5 `ui/checkbox.tsx` + `ui/radio.tsx`: upgrade (forms, roles, planos, LGPD)
- [x] 2.6 `ui/toggle-group.tsx` (novo, de `ToggleGroup.md`; filtros, view switch)
- [x] 2.7 `ui/avatar.tsx`: upgrade (presença online/offline, de `UserAvatar.md`)
- [x] 2.8 `ui/copy-button.tsx`: upgrade (mantém "lucide instead of react-icons"; consome `lib/icons`)
- [x] 2.9 `ui/circular-progress.tsx` (novo, de `AnimatedCircularProgressBar.md`; quota/storage/billing)
- [x] 2.10 Reescrever hardcodes (`zinc`, hex) das variantes de referência p/ `var(--color-*)`;
  `motion/react` (não `framer-motion`); durações 120–250ms UI

## F3 — Componentes portados (todos via `lib/icons.tsx`, sem exceção)

- [x] 3.1 `components/theme-toggle.tsx` (de `SwitchModeToggle.md`; knob spring; usa
  `src/external/theme.ts`, **não** `next-themes`; variante hex → tokens); substitui `layout.tsx:1`
- [x] 3.2 `pages/NotFound.tsx`: layout `ErrorOne` (gradiente + pill + grid `var(--primary)`),
  remove `House` direto → via `lib/icons`
- [x] 3.3 `ui/file-uploader.tsx` (de `FileUpload.md`; drag&drop, `maxFiles/maxSizeMB`, lista c/ status;
  `react-icons/fa` → `lib/icons`)
- [x] 3.4 `components/billing/credit-usage-card.tsx` (barra 75 segmentos, histórico, popovers, export CSV;
  ícones restantes `react-icons` → `lib/icons`)
- [x] 3.5 `ui/run-action-button.tsx` (3-estados `idle→running→done`; só `Zap` lucide via `lib/icons`;
  uso restrito a jobs/pipelines, **não** CRUD)
- [x] 3.6 `ui/gooey-menu.tsx` (de `Tooltip.md`; reescrito sem `react-icons`, só lucide via `lib/icons`;
  escopo: debug overlay — tooltip genérico continua `ui/tooltip.tsx`)
- [x] 3.7 `DeplymentCard.md` descartado (duplicata); registrar motivo em `design.md`

## F4 — Tokens, tipografia, a11y, layouts reutilizáveis

- [x] 4.1 `src/index.css`: `--font-sans: "Inter Variable", ...` + `--font-mono: "JetBrains Mono Variable", ...`
  em `@theme inline`; escala `DESIGN.md §4.3` (KPI principal `text-3xl–4xl + tabular-nums`)
- [x] 4.2 Revisão fina de espaçamentos (`--row-gap` compact/confortável); **cores/radius inalterados**
- [x] 4.3 `prefers-reduced-motion` em toda animação; só `transform/opacity` (sem `width/height/top/left`)
- [x] 4.4 Foco `focus-visible:ring-2` em todos os novos interativos; `aria-live="polite"` em KPIs
  com debounce; gráficos/texto alternativo (`aria-label` com insight)
- [x] 4.5 Layouts: `PageHeader` (estender `feedback.tsx`), `KpiGrid` (`@container`),
  `CrudPage`, `SettingsTabs`, `EmptyState/ErrorState`; aplicar em `AdminOverview/Users/Orgs/Audit`
- [x] 4.6 Estender `ui/ui-catalog.test.tsx` (novos primitivos) + testes `lib/icons` (re-exporta o esperado);
  snapshots Playwright `admin-overview|admin-users|login|not-found`

## Gates (release minor, PR única)

- [x] 5.1 `vitest run` + `tsc -b && vite build` + `oxlint` verdes
- [x] 5.2 `playwright test --project=chromium` verde (axe sem serious, `reducedMotion:reduce`)
- [x] 5.3 Mobile 360px sem overflow; checklist visual §9 do plano (11 itens) executado e anexado à PR
- [x] 5.4 `grep` ícones/SVGs: zero imports fora de `lib/icons.tsx`; zero `zinc`/hex hardcoded em novos arquivos
- [x] 5.5 `git status --short` só escopo `client/` + `docs/review-design.md`; sem segredos; sem commit sem pedido
- [x] 5.6 PR `feat/client-design-unification` → squash → tag minor + CHANGELOG
  (`git-workflow-and-versioning` + `shipping-and-launch`)

## Implementation notes (2026-09-16, PR `feat/client-design-unification`, code-reviewer pass)

- F1–F4 implemented; gates green: `vitest` 80/80, `tsc -b`, `vite build`,
  `oxlint` exit 0, Playwright chromium full suite green (5 snapshots regenerated
  intentionally: landing/login/not-found/home-member/admin-users-forbidden).
- F2 audits with **no delta** (already Base-UI + motion + tokens, verified against
  references): `alert-dialog` (destructive confirms), `tabs` (sliding pill),
  `checkbox` (motion check draw), `radio` (spring indicator), `avatar`
  (initials + presence). Reference-only extras (checkbox accent/size, avatar
  group, tabs auto-height) deferred — no admin consumer in this change.
- `run-action-button` step icons via `@/lib/icons` (IconType) **is** the golden
  rule per owner decision 2026-09-16 (two libs, one file); trigger uses `Zap`
  (lucide). Spec lines about "só Zap" refer to the trigger, not step icons.
- Drawer breakpoint corrected to `<md` per DESIGN.md §6 (was `<lg`); rail
  `md–xl`, expanded `≥xl` + cookie override.
- F4.5 `CrudPage`/`SettingsTabs` are documented **patterns** (composed from
  primitives; applied in `AdminOverview`/`Health`), not components — avoids
  speculative abstraction with a single consumer. `EmptyState` added as a real
  component (`error-state.tsx`); `ErrorOne` covers error states.
- Foco: `ring-2` em todos os arquivos novos/alterados (DESIGN.md §8); `ring-1`
  legado (`button`, `tabs`, `checkbox`…) migra oportunisticamente.
- Exceção registrada: `gooey-menu` anima `width/height` (o efeito goo exige;
  bounded, spring, `useReducedMotion` + CSS safety net). Gauge/bar durations
  reduzidos p/ 200ms (teto 120–250ms).
- Out-of-scope executado sob ordem explícita do dono: `.opencode/agents/ui-designer.md`
  `temperature 0.3 → 0.4`. `references/components_to_use/` untracked é pré-existente,
  não criado nesta change.
