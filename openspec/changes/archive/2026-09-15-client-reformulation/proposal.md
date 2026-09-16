## Why

O `/client` funciona mas nasceu por acréscimo: tokens sem fonte única auditável, `ui/` com 6 arquivos, sem catálogo de componentes, sem teste de browser, sem agentes de frontend. `docs/DESIGN.MD` (guia externo) e `/references/components_to_use` (18 padrões Animate UI) existem sem vínculo com o projeto. Reformulação faseada via PR, cada etapa revisada e com gates.

## What Changes (6 PRs a partir de `main`)

- **PR1 fundação** (esta): `docs/DESIGN.MD` → `docs/DESIGN.md` (links fixos) + ponteiro em `AGENTS.md` + trio (`ui-designer`, `frontend-implementer`, `design-auditor`) + triagem `web-design-guidelines` + harness Playwright (axe + snapshots, Chromium) com 1 fumaça verde.
- **PR2 tokens**: `index.css` `@theme` sincronizado com DESIGN.md §4.
- **PR3 catálogo**: 10 padrões de `/references` adaptados com `motion` pinado (tabs, tooltip, alert-dialog, checkbox, radio, accordion, avatar, copy-button, switch, 404); `react-icons` → `lucide`; `FileTree`/`RunActionButton`/cards de exemplo fora.
- **PR4 base+forms**: KpiCard, `Skeleton`+`Suspense`, RHF+Zod se aprovado na PR.
- **PR5 páginas**: aplica tokens/base, remove clichês §3.7; sem endpoint novo.
- **PR6 auditoria**: axe+snapshot em tudo, `@axe-core/react` em dev, docs, `archive`.

## Capabilities

### New Capabilities

- `design-system-link`: DESIGN.md como fonte de verdade + agentes + skill a11y.
- `browser-e2e`: Playwright (axe + snapshots, Chromium) com `make web-e2e`.

### Modified Capabilities

- Nenhuma (fundação não muda comportamento).

## Impact

- PR1: `AGENTS.md`, `docs/DESIGN.md`, 3 agentes, 1 triagem, `client/e2e/*` + devDeps pinadas + job `web` no CI + `make web-e2e*`.
- Riscos: tempo de CI +~3min; baselines só atualizados conscientemente no ubuntu.

## Non-goals (v2 §21)

Mudar UI nesta PR; novos runtimes além de `motion` (PR3) e tooling de teste; MCPs.

## Acceptance criteria

1. `openspec validate` ok; agentes seguem o template (frontmatter + PT-BR + permissões).
2. `make web-e2e` verde local (Chromium, fumaça `/` carrega + axe sem sérias/críticas).
3. CI com job `web` nos mesmos alvos; `npm run build/lint/test:run` intactos.
