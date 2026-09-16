## Context

`AGENTS.md:33-44` (tabela de 6 agentes + primários); `code-reviewer.md:1-12` (template: frontmatter description/mode/temperature/permission); `docs/DESIGN.MD:44-55` (pede ponteiro no boot + fonte única); stack client: React 19 + Vite 8 + Tailwind v4 + shadcn new-york + Base UI + tweakcn (sem browser tests; E2E é só HTTP via `scripts/e2e_spa_flow.py`); `ci.yml` sem job frontend.

## Goals / Non-Goals

**Goals:** vínculo DESIGN.md↔agentes↔skills; harness que as PRs 3–6 usam; zero mudança visual.
**Non-Goals:** qualquer pixel novo; Motion (PR3); axe em dev (PR6).

## Decisions

1. **Rename + fix de links, sem reescrever conteúdo alheio** — `git mv` preserva história; links `http://DESIGN.md` → relativos; registro no `SKILLS-REGISTRY` como referência adotada.
2. **Trio espelha o backend** (`ui-designer` propõe read-only, `frontend-implementer` executa pós-change, `design-auditor` audita read-only com Playwright) — mesma gramática de permissões do `code-reviewer`.
3. **Playwright em `client/e2e/`** (não `tests/` do backend): `playwright.config.ts` com `baseURL` do `WEB_PORT`, `webServer` no `vite preview` (build já validado), Chromium, `workers: 1` no CI, `animations: disabled` + `reducedMotion: reduce` + viewport fixo p/ snapshots; auth via `storageState` pela API real.
4. **CI chama `make web-e2e`/`web-e2e-install`** (regra: nunca duplica comando); browsers via cache do `setup-node`? Não há setup-node hoje — job instala node + `npx playwright install --with-deps chromium`.

## Risks / Trade-offs

- [Baselines gerados no Windows divergem do ubuntu → gerar/atualizar baselines só no CI (`--update-snapshots` nunca local)] → documentado no teste e no Makefile.
- [PR1 sem `motion` ainda: fumaça só estrutural+axe] → snapshots reais entram na PR3 junto das animações desligadas por config.

## Migration Plan

Aditivo. Rollback = reverter branch (PR não mergeada não afeta `main`).

## Open Questions

- Nenhuma bloqueante.
