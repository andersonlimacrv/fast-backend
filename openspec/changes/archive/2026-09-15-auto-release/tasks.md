## 1. Script + testes (TDD, sem rede/git)

- [x] 1.1 `scripts/auto_release.py`: `next_version(tags, bump)` (max de `v*`/`X.Y.Z`, patch default) + `finalize_changelog(text, version, date, fallback)` (consolida Unreleased, stub vazio, fallback do título) + `sync_files(...)` (pyproject/settings/.env.example) + `main()` orquestrando via git CLI
- [x] 1.2 `app/tests/unit/test_auto_release.py`: bump a partir de `0.1.0` e de `v1.2.3`; consolidação de 2 Unreleased; fallback; arquivos sincronizados (tmp); Unreleased vazio mantido

## 2. Workflow + docs

- [x] 2.1 `.github/workflows/auto-release.yml` (PR merged no `main` + dispatch manual com `bump`/`dry-run`; `contents: write`; `git push --follow-tags`)
- [x] 2.2 ADR `0011-auto-release.md` (PT-BR) + spec `release-automation` (delta) + nota no `CHANGELOG.md` + `DEPLOYMENT.md` (runbook vira "automático; rollback = deletar tag/release + revert")
- [x] 2.3 Validar YAML (`python -c yaml.safe_load`) + dry-run local do script contra cópia do repo

## 3. Gates

- [x] 3.1 `ruff + mypy + bandit` no script; `pytest -m unit`
- [x] 3.2 `openspec verify` 3 dimensões antes de `archive`
