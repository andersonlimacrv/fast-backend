## Why

O auto-release pós-merge funciona, mas tem dois defeitos provados na prática: (1) falha descoberta só depois do merge (identidade git, loop do token, encoding Windows); (2) todo merge cunha release — até `fix(ci)` — gerando ruído de versão. Falta verificação barata em tempo de PR e regra de silêncio.

## What Changes

- Workflow `release-check.yml` (PR, só leitura): dry-run do script + exige entrada `[Unreleased]` no diff quando a PR toca comportamento (`app/**`, `client/src/**`, `scripts/**`, `pyproject.toml`, manifests, `Dockerfile`, composes, `Makefile`, `.github/**`); docs-only (`*.md`, `docs/**`, licenças, gitignore, `openspec/**`) passa sem entrada.
- Regra de silêncio no `auto-release.yml`: sem `[Unreleased]` com conteúdo E sem `CHANGELOG.md` no merge → loga `nothing to release`, exit 0, sem tag.
- ADR 0012 refinando a 0011; `DEPLOYMENT.md` (+pt-BR) documenta os dois gates.

## Capabilities

### New Capabilities

- Nenhuma (automação de processo).

### Modified Capabilities

- `release-automation`: check em tempo de PR + silêncio quando não há o que lançar.

## Impact

- Novo: `.github/workflows/release-check.yml`, flag `--check`/`--if-needed` em `scripts/auto_release.py`, testes, ADR 0012.
- Alterado: `auto-release.yml`, `DEPLOYMENT.md` (+pt-BR), `CHANGELOG.md` (entrada desta change).
- Sem loop novo: check é só leitura; silêncio reduz pushes.

## Non-goals (v2 §21)

Versionamento por label; bloquear merge por falta de changelog em PR docs-only; dry-run local obrigatório.

## Acceptance criteria

1. PR sem entrada e com código → check falha com mensagem acionável; PR docs-only passa.
2. Merge sem conteúdo lançável → `nothing to release`, sem tag, exit 0.
3. Merge normal → release como antes (sem regressão; suite do script verde).
4. Gates + `openspec verify` antes de `archive`.
