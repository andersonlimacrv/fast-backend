## 1. Spec

- [x] 1.1 `openspec/changes/auto-release-bump-infer/{proposal,tasks,design}.md` (este change)
- [x] 1.2 Aprovação do dono antes de implementar

## 2. Implementação (`scripts/auto_release.py`)

- [x] 2.1 `infer_bump(pr_title: str, pr_body: str = "") -> str` pura (major/minor/patch)
- [x] 2.2 `resolve_bump(bump_arg: str, pr_title: str, pr_body: str = "") -> str`
  (explícito vence; `auto`/desconhecido → inferência)
- [x] 2.3 `--bump` com `choices=[patch, minor, major, auto]`, default `auto`;
  `main()` usa `resolve_bump`; docstring do módulo atualizada (fluxo + precedência)
- [x] 2.4 `.github/workflows/auto-release.yml`: input `bump` default → `auto`,
  chamada `--bump "${{ inputs.bump }}"`

## 3. Testes (`app/tests/unit/test_auto_release.py`, sem git/rede)

- [x] 3.1 `feat`/`feat(api)` → minor; `fix`/`perf`/`refactor`/`docs`/`test`/`chore`/`ci`/`build`/`style`/`revert` → patch
- [x] 3.2 `BREAKING CHANGE` (título e corpo), `feat!:` / `fix(api)!:` → major
- [x] 3.3 Título vazio, sem prefixo, maiúsculas (`Feat:`) → minor/patch corretos
- [x] 3.4 `resolve_bump`: explícito vence (`minor` sobre título `fix:`); `auto` infere

## 4. Gates

- [x] 4.1 `make lint` + `make types` + `make test-unit` verdes
- [x] 4.2 `git status --short` só escopo; sem segredos; Conventional Commits
- [x] 4.3 PR própria → merge → **sem release imediata** (vale nos próximos merges)
