# deps-security-bump — tasks

- [x] 1.1 `pyproject.toml`: `PyJWT>=2.8`→`>=2.15`; `uv lock --upgrade-package multidict pyjwt urllib3` → 6.9.1 / 2.15.1 / 2.8.0
- [x] 1.2 Gates: `pip-audit` clean, bandit clean, unit 140/140, refresh+auth integration 12/12 (Postgres real). Adjacente documentado: `test_bootstrap_tree` falhava por bug latente (`new_project.py` copiava `.git`-arquivo de worktree; `EXCLUDE_DIRS` só poda dirs) — fix em `scripts/new_project.py`, coberto pelo próprio teste
- [x] 1.3 CHANGELOG note (na entrada `deps-security-bump` abaixo)
- [ ] 1.4 Sem commit sem pedido
