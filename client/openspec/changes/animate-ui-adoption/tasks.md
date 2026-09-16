## F0 — Fonte e ferramental

- [ ] 0.1 Trabalhar só dos 11 `.md` vendored (`references/components_to_use/AnimateUi/`);
  sem MCP, sem `npx shadcn add` (auditoria MCP em `design.md`)
- [ ] 0.2 Branch `feat/animate-ui-adoption` (testa o release flow de novo)

## F1 — Auditoria motion + hooks (bloqueia lanes)

- [ ] 1.1 Grep nos 11 docs: pacotes motion além de `motion/react`? (`motion-dom`? outros?)
- [ ] 1.2 `motion@13.3.0` travado; divergência → pergunta ao dono antes de instalar
- [ ] 1.3 `use-mobile` (Sidebar upstream): criar `@/hooks/use-mobile.ts` ou manter `matchMedia`
- [ ] 1.4 Registrar achados no ledger §11 (coluna "lib audit")

## F2 — Lanes de reconcile (arquivos disjuntos, paralelizáveis)

### Lane A — overlays (`general`)

- [ ] A.1 `ui/dialog.tsx`: spring `Transition` presets do upstream (manter API + `useReducedMotion`)
- [ ] A.2 `ui/alert-dialog.tsx`: idem A.1
- [ ] A.3 `ui/tabs.tsx`: adotar `TabsPanels` + `AutoHeight` (maior delta); manter `TabsRoot/List/Tab/Indicator/Panel` + aliases
- [ ] A.4 DEMOs Dialog/AlertDialog/Tabs alinhados (dados neutros, sem `console.log`)

### Lane B — inputs (`general`)

- [ ] B.1 `ui/checkbox.tsx`: alinhar API `HTMLMotionProps` + composição com Label (Label fora do primitivo)
- [ ] B.2 `ui/radio.tsx`: idem B.1
- [ ] B.3 `ui/toggle-group.tsx`: DEMO `Bold/Italic/Underline` via `lib/icons` (adicionar se faltar)
- [ ] B.4 `ui/copy-button.tsx`: `hoverScale`/`tapScale` + variants do upstream (manter feedback atual)

### Lane C — estrutura (`general`)

- [ ] C.1 `ui/accordion.tsx`: spring presets do upstream
- [ ] C.2 `AvatarGroup` novo (grupo online/offline c/ transições; `Avatar` single intacto)
- [ ] C.3 `ui/file-tree.tsx` novo (`base-files` sobre accordion; `FileIcon` via `lib/icons`)
- [ ] C.4 Sidebar: importar motion patterns do upstream p/ `app-sidebar.tsx` (manter Base-UI, sem radix)

### Comum às lanes

- [ ] Tokens em tudo (`rounded-2xl`/`neutral`/`zinc`/hex → tema); `motion` ≤250ms; `useReducedMotion`
- [ ] Ícones/SVGs só via `@/lib/icons` (reportar falta em vez de importar direto)
- [ ] `tsc -b` verde nos arquivos da lane; log de linha p/ ledger §11

## F4 — Gallery staff-only (eu)

- [ ] 4.1 `pages/Gallery.tsx` + `ROUTES.gallery` + rota sob `RequireStaff` (fora do bundle público)
- [ ] 4.2 11 DEMOs adaptados (neutros, keyboard-ok); sidebar ganha item Gallery (staff)
- [ ] 4.3 `ui-catalog.test.tsx`: casos dos DEMOs onde fizer sentido
- [ ] 4.4 e2e: axe + snapshots `gallery-*.png` + 403 p/ member

## F5 — Registrar, auditar, visualizar, otimizar

- [ ] 5.1 Ledger `review-design.md` §11 completo (11 linhas: CLI/Link/DEMO/delta/decisão)
- [ ] 5.2 `code-reviewer` (3 eixos) + `design-auditor` (axe)
- [ ] 5.3 Greps: icons, `zinc`/`neutral`/hex, `radix`/`animate-ui` npm, `asChild`
- [ ] 5.4 Playwright full + `-u` local + seed linux via workflow dedicado
- [ ] 5.5 `vite build`: conferir `motion` tree-shaken + `react-icons` restrito; code-split gallery se >orçamento
- [ ] 5.6 Gates backend (`lint/types/test-unit` — app/ intocado, roda tudo) + `release-check`
  (CHANGELOG `[Unreleased]` desde o commit 1!)
- [ ] 5.7 PR única → squash → release (título `feat:` → minor)

## Implementation notes (2026-09-16, working tree pré-PR)

- F0–F2 lanes A/B/C + F4 gallery implementados; `tsc`, `vitest` 86/86, `oxlint` 0,
  `vite build`, Playwright chromium full green (gallery entra no loop 403 de member).
- Ajustes pós-review: `ResizeObserver` guard (jsdom/SSR), `cleanup` entre testes,
  `ROW_CLASS`/`toggleVariants` multilinha, `ring-2` em file-tree/run-action-button,
  testes checkbox-accent-lg/copy-controlled/toggle-icons.
- Staff-render da gallery: sem seed de staff no CI → coberto por member-403+axe;
  render staff é checklist manual (§9 do plano anterior).
- `tsconfig` sem `strict:true` (pré-existente) — fora deste escopo, candidato a ADR.
