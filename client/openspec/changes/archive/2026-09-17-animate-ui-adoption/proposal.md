## Why

`client/` tem 10 primitivos próprios (Base-UI + `motion`, entrega `design-unification`)
que duplicam em espírito os 11 docs vendored em `references/components_to_use/AnimateUi/`
(CLI + Link + DEMO por componente, fonte congelada). Sem reconcile, os dois divergem:
upstream tem motion patterns que não temos (`TabsPanels` + `AutoHeight`, `hoverScale`/
`tapScale`, spring `Transition` presets, `AvatarGroup`, `FileTree`) e nossos tokens
(lima, `radius: 0`) não existem no upstream (`rounded-2xl`, `neutral-*`, `zinc`).
`FileTree` (deferido na change anterior) ganha encaixe agora: explorer/templates + gallery.

## What Changes

- **F0:** sem MCP (só `.md` vendored); sem `npx shadcn add` (porte manual, sem deriva).
- **F1:** auditoria motion nos 11 docs (só `motion/react`?); `motion@13.3.0` travado;
  decisão `use-mobile` (hook novo vs `matchMedia` existente).
- **F2/Lanes:** reconcile dos 10 existentes (presets spring, scales, `AutoHeight`,
  `AvatarGroup` novo, DEMOs alinhados) + `ui/file-tree.tsx` novo; Sidebar nossa mantida
  (só ele usa trilha radix; wrappers radix não vendored → sem fetch).
- **F4:** rota `/admin/gallery` (`RequireStaff`) com os 11 DEMOs adaptados + e2e/snapshots.
- **F5:** ledger `review-design.md` §11, audits, `vite build` (bundle), otimização se necessário.
- Tema preservado (cores/radius); upstream adaptado p/ tokens; ícones/SVGs via `lib/icons.tsx`.

## Capabilities

### New Capabilities

- `animate-ui-adoption`: reconcile upstream + `FileTree` + `AvatarGroup` + gallery staff-only.
- `component-ledger`: `review-design.md` §11 (CLI/Link/DEMO/delta/decisão por componente).

### Modified Capabilities

- `client-primitives`: presets spring, `AutoHeight`, scales, DEMOs alinhados.
- `admin-dashboard-shell`: rota gallery sob `RequireStaff`.

## Impact

- `client/src/components/ui/*` (10 reconciles + `file-tree.tsx`), `components/avatar-group.tsx`?,
  `pages/Gallery.tsx` + rota + `ROUTES.gallery`, `lib/icons.tsx` (se faltar ícone),
  `ui-catalog.test.tsx`, `e2e/*` + snapshots, `docs/review-design.md` §11.
  **Nenhum arquivo `app/`; nenhuma dependência npm nova** (salvo achado em F1, com pergunta).

## Non-goals

- MCP shadcn (decidido: não); `npx shadcn add`; Sidebar radix upstream;
  TanStack/Recharts (outra change); `ExpandDetails`/`SubsriptionCalendar` (futura);
  trocar `lib` de ícones (deferido pelo dono); reescrever `v0.2.0`.

## Acceptance criteria

1. Cada um dos 11 docs tem linha no ledger §11 (CLI/Link/DEMO/delta/decisão).
2. `TabsPanels`+`AutoHeight`, scales no CopyButton, spring presets, `AvatarGroup`,
   `FileTree` implementados sob tokens, `motion` ≤250ms, `useReducedMotion`.
3. Gallery staff-only renderiza os 11 DEMOs; member recebe 403; axe sem serious.
4. Greps: zero imports de icon libs fora de `lib/icons.tsx`; zero `zinc`/`neutral-`/hex;
   zero `radix`/`animate-ui` npm novo; zero `asChild`.
5. Gates: `vitest` + `tsc` + `build` + `oxlint` 0 + Playwright full + `make lint/types/test-unit`
   + `release-check` (CHANGELOG `[Unreleased]` desde o commit 1).
6. PR única → squash → release (bump inferido do título `feat:` → minor).
