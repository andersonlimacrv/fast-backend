## Why

`auto-release.yml:50` passa `--bump "${{ inputs.bump || 'patch' }}"`: em evento de merge
`inputs` é vazio e cai sempre em `patch`. Features (`feat(client): dashboard…`) saem como
patch (`v0.1.2`), subestimando o impacto e quebrando a expectativa de semver do repo
(ADR 0011/0012, `git-workflow-and-versioning`). O workflow já entrega `PR_TITLE` ao script,
mas só como fallback de texto — nunca para decidir o bump.

## What Changes

- `scripts/auto_release.py`: nova função pura `infer_bump(pr_title, pr_body="")` +
  `resolve_bump(bump_arg, pr_title, pr_body="")`; `--bump` ganha valor `auto` (novo default).
  Precedência: explícito (`patch|minor|major`) > inferência > `patch`.
- `.github/workflows/auto-release.yml` (2 linhas): input `bump` default `patch` → `auto`;
  chamada passa `--bump "${{ inputs.bump || 'auto' }}"` (em evento de merge `inputs` é
  vazio e cai em `auto` → inferência).
- `app/tests/unit/test_auto_release.py`: casos de `infer_bump`/`resolve_bump` (sem git/rede).
- Sem mudança em `release.yml`, `release_notes.py`, política de `[Unreleased]`, `CHANGELOG.md`
  (esta change não gera release — só passa a valer nos próximos merges).

## Capabilities

### New Capabilities

- Nenhuma (automação interna).

### Modified Capabilities

- `release-automation`: bump inferido do título convencional da PR.

## Impact

- `scripts/auto_release.py`, `app/tests/unit/test_auto_release.py`,
  `.github/workflows/auto-release.yml` (2 linhas). `app/` runtime intocado
  (script + teste unitário puro).

## Non-goals

- Reescrever `v0.1.2` ou qualquer tag histórica; mudar default de `workflow_dispatch`
  além de `auto`; inferir por arquivos alterados ou labels (só título/corpo);
  tocar `release-check.yml` (gate de entrada continua igual).

## Acceptance criteria

1. `feat: x` / `feat(scope): x` → `minor`; `fix/perf/refactor/docs/test/chore/ci/build/style/revert` → `patch`.
2. `BREAKING CHANGE` no título (e no corpo quando `pr_body` for passado; o workflow
   atual só fia o título — ver dívida em `design.md`) ou `!` (`feat!:`, `feat(api)!:`) → `major`.
3. Título fora do padrão ou vazio → `patch` (default seguro); case-insensitive.
4. `--bump minor` explícito vence a inferência; `--bump auto` (default) infere.
5. `make lint && make types && make test-unit` verdes; `ruff` line-length 128.
