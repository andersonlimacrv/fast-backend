## Why

`[Unreleased]` acumula no CHANGELOG (hoje 2 seções) e release depende de passo manual (tag + seção). Regra do operador: **toda PR merged vira release automaticamente** — nada parado em Unreleased.

## What Changes

- Workflow `auto-release.yml`: em `pull_request: closed` com `merged == true` no `main`, calcula próximo patch da maior tag (`v*` ou `X.Y.Z`; sem `v*` ainda → base `0.1.0`), consolida **todas** as seções `[Unreleased]` na nova `## [vX.Y.Z] — data`, deixa stub `[Unreleased]` vazio, sincroniza `pyproject.toml` + `app_version` default + `.env.example`, commita, tagueia e pusha. O `release.yml` existente (on tag) cria o GitHub Release — cadeia sem loop (push não abre PR).
- `scripts/auto_release.py` com a lógica pura + `app/tests/unit/test_auto_release.py` (sem rede, sem git).
- Se Unreleased vazio/ausente: entrada gerada do título da PR.
- Bump minor/major continua manual (`workflow_dispatch` com input; default patch).

## Capabilities

### New Capabilities

- Nenhuma (automação de processo).

### Modified Capabilities

- `release-automation`: além de tag→Release, PR-merged→bump+tag+Release automáticos.

## Impact

- Novo: `.github/workflows/auto-release.yml`, `scripts/auto_release.py`, testes, ADR 0011, spec delta.
- Alterado: `CHANGELOG.md` (consolidação das 2 Unreleased), docs de deploy.
- Permissão `contents: write` (mesma do `release.yml`).

## Non-goals (v2 §21)

Release-please/bots externos; versionamento por label de PR; dry-run local de tag.

## Acceptance criteria

1. PR merged com entrada Unreleased → bump patch, tag `v*`, Release criado com notes da seção.
2. Unreleased vazio → entrada cai do título da PR, release sai mesmo assim.
3. Duas seções `[Unreleased]` consolidadas em uma versão, stub vazio restante.
4. `pyproject`/`settings`/`.env.example` com a mesma versão (sem `v` nos arquivos, com `v` na tag).
5. Loop impossível: push do bot não re-dispara (trigger só em PR merged).
