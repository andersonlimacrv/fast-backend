## Why

O código está em v1.0.0 mas a presença OSS não: README sem badges/TOC, `.github/README.md` obsoleto ("nenhum workflow", Fase 3) confunde navegação, sem CONTRIBUTING/SECURITY/templates, releases manuais, e sem guias de uso/escala/arquitetura para quem chega (skills `documentation-and-adrs`, `docs-generate`, `git-workflow-and-versioning`, `shipping-and-launch`, `ci-cd-and-automation` instaladas para este trabalho).

## What Changes

- `README.md` profissional: badges (CI, tag/release, Python, license, testes), TOC, quickstart, comandos, estrutura, links p/ docs. Esclarecido em texto: GitHub renderiza a raiz (o `.github/README.md` obsoleto sai).
- Remove `.github/README.md` obsoleto (workflows já existem desde a Fase 2).
- Arquivos OSS: `CONTRIBUTING.md` (setup, gates, convenções, como propor change), `SECURITY.md` (versões suportadas, como reportar, escopo), `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md`, `.github/pull_request_template.md`.
- Release automation: `.github/workflows/release.yml` (on tag `v*.*.*`: extrai seção do CHANGELOG → `gh release create` com notes; falha se tag sem entrada no CHANGELOG). CHANGELOG segue fonte da verdade (skill `git-workflow-and-versioning`).
- Guias alimentados a partir do código (skills `documentation-and-adrs`, `docs-generate`): `docs/ARCHITECTURE.md` (mapa de módulos, DAG, fluxos request→módulo→contrato→infra, índice de ADRs), `docs/SCALING.md` (knobs: pool, workers, TTLs; quando vertical basta; RLS/replicas/split como futuros com gatilhos), `docs/guides/add-module.md` (5 passos, extraído do padrão projects/entitlements).

## Capabilities

### New Capabilities

- `oss-presence`: badges, arquivos OSS, templates, limpeza `.github/README`.
- `release-automation`: tag → GitHub Release a partir do CHANGELOG (+ gate).
- `guides-docs`: ARCHITECTURE + SCALING + add-module gerados do código real.

### Modified Capabilities

- (vazio)

## Impact

- Só docs, workflows e scripts de release; zero mudança em `app/`.
- Badges shields.io (estáticos) + release dinâmico por workflow (sem bots terceiros).
- `.github/README.md` removido (conteúdo falso hoje).

## Non-goals

GitHub Pages/site de docs, logo/brand, tradução, README em outro idioma, `release-drafter` bot, OpenAPI publicado.

## Acceptance criteria

1. README abre com badges funcionais (CI, release, Python, license, testes) + TOC; `grep` não acha "cache?" nem contagens velhas.
2. `.github/` sem README obsoleto; CONTRIBUTING/SECURITY/templates presentes e linkados do README.
3. Push de tag `v*` (dry-run documentado ou release real menor) gera Release com notes = seção do CHANGELOG; tag sem entrada falha o workflow.
4. `docs/ARCHITECTURE.md` reflete os 7 contratos import-linter + DAG reais; `SCALING.md` lista knobs com valores default do `settings.py`; `add-module.md` reproduzível (checklist executável).
5. Full gates verdes (docs não quebram lint de markdown? sem gate novo — só `git status` limpo de lixo).
