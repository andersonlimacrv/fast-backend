## 1. Spec

- [ ] 1.1 `openspec/changes/auto-release-bump-infer/{proposal,tasks,design}.md` (este change)
- [ ] 1.2 Aprovação do dono antes de implementar

## 2. Implementação (`scripts/auto_release.py`)

- [ ] 2.1 `infer_bump(pr_title: str, pr_body: str = "") -> str` pura (major/minor/patch)
- [ ] 2.2 `resolve_bump(bump_arg: str, pr_title: str, pr_body: str = "") -> str`
  (explícito vence; `auto`/desconhecido → inferência)
- [ ] 2.3 `--bump` com `choices=[patch, minor, major, auto]`, default `auto`;
  `main()` usa `resolve_bump`; docstring do módulo atualizada (fluxo + precedência)
- [ ] 2.4 `.github/workflows/auto-release.yml`: input `bump` default → `auto`,
  chamada `--bump "${{ inputs.bump }}"`

## 3. Testes (`app/tests/unit/test_auto_release.py`, sem git/rede)

- [ ] 3.1 `feat`/`feat(api)` → minor; `fix`/`perf`/`refactor`/`docs`/`test`/`chore`/`ci`/`build`/`style`/`revert` → patch
- [ ] 3.2 `BREAKING CHANGE` (título e corpo), `feat!:` / `fix(api)!:` → major
- [ ] 3.3 Título vazio, sem prefixo, maiúsculas (`Feat:`) → minor/patch corretos
- [ ] 3.4 `resolve_bump`: explícito vence (`minor` sobre título `fix:`); `auto` infere

## 4. Gates

- [ ] 4.1 `make lint` + `make types` + `make test-unit` verdes
- [ ] 4.2 `git status --short` só escopo; sem segredos; Conventional Commits
- [ ] 4.3 PR própria → merge → **sem release imediata** (vale nos próximos merges)
