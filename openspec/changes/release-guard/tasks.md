## 1. Script + testes (TDD)

- [x] 1.1 `files_need_release(files) -> bool` (EXEMPT explícito) + `--check` (lê lista via args/`--files-from`, exit 0/1 + motivo)
- [x] 1.2 `--if-needed` no `main()`: sem corpos Unreleased e sem CHANGELOG no merge → `nothing to release`, exit 0, sem tocar nada
- [x] 1.3 `app/tests/unit/test_auto_release.py`: EXEMPT cobre docs-only; código sem entrada falha; silêncio não toca arquivos (tmp) nem taggeia

## 2. Workflows + docs

- [x] 2.1 `.github/workflows/release-check.yml` (PR: checkout full + dry-run + check do diff)
- [x] 2.2 `auto-release.yml` chama com `--if-needed`
- [x] 2.3 ADR `0012-release-guard.md` + `DEPLOYMENT.md` (+pt-BR) + entrada CHANGELOG desta change

## 3. Gates

- [x] 3.1 `ruff + mypy + bandit`, `pytest -m unit`, YAML parse dos workflows
- [x] 3.2 `openspec verify` 3 dimensões antes de `archive`
