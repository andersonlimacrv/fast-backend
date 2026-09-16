## PR1 fundação (este branch `reform/pr1-foundation`)

- [x] 1.1 `git mv docs/DESIGN.MD docs/DESIGN.md`, fix self-links, ponteiro `## Design system` no `AGENTS.md`, registro em `SKILLS-REGISTRY.md`
- [x] 1.2 Trio `.opencode/agents/{ui-designer,frontend-implementer,design-auditor}.md` + 3 linhas na tabela §5 do `AGENTS.md`
- [x] 1.3 Triagem `web-design-guidelines` (SHA pinado; já instalada @`063bee9` — registrar uso nesta reformulação)
- [x] 1.4 Harness `client/e2e/` (`playwright.config.ts`, `smoke.spec.ts`, `a11y` helper) + devDeps pinadas + `make web-e2e*` + job `web` no CI + docs Makefile
- [x] 1.5 Gates: `npm run build/lint/test:run`, `make web-e2e` verde, `openspec verify`, PR com reviewers + CI verde

## PR2–PR6 (branches futuros, mesmo rito)

- [x] 2.1 PR2 tokens (`index.css` ⇐ DESIGN.md §4)
- [x] 2.2 PR3 catálogo `/references` + `motion` pinado
- [x] 2.3 PR4 base+forms (RHF+Zod sob aprovação)
- [x] 2.4 PR5 páginas (sem endpoint novo)
- [x] 2.5 PR6 auditoria total + `@axe-core/react` + docs + `archive`
