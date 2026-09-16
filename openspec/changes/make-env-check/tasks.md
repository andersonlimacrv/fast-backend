## 1. Script + testes (TDD)

- [x] 1.1 `scripts/env_check.py`: parse, drift, regras de forma, saída, exit codes (+ cabeçalho documentando a duplicação intencional)
- [x] 1.2 `app/tests/unit/test_env_check.py`: drift detectado, valores inválidos nomeados, **nenhum valor impresso** (assert no stdout capturado), exit codes, linha estranha ignorada

## 2. Fiação + docs

- [x] 2.1 `Makefile`: `env-check` + `setup` encadeado + `.PHONY`
- [x] 2.2 `docs/Makefile.md` + `.pt-BR.md`; `CHANGELOG.md` 1 linha

## 3. Gates

- [x] 3.1 `ruff + mypy` em `scripts/env_check.py` + testes; `pytest -m unit`
- [x] 3.2 Manual: `.env` real do operador → report lista as 6 chaves, exit 1, sem segredos
- [x] 3.3 `openspec verify` 3 dimensões antes de `archive`
