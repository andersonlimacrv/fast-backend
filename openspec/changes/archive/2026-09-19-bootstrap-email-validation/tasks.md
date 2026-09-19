## 1. Change (esta change)

- [x] 1.1 `openspec/changes/bootstrap-email-validation/{proposal,tasks,design}.md` + aprovação do dono

## 2. Implementação (`scripts/bootstrap_root.py`)

- [x] 2.1 `validate_root_email()` pura (formato, sem DNS) + chamada em `bootstrap()` pós-chave, pré-DB
- [x] 2.2 Inválido → `ValueError(GENERIC_FAILURE)` (genérico preservado)

## 3. Testes

- [x] 3.1 Unit sem DB: sem-`@`, sem-domínio e vazio recusados antes do banco; válido passa do gate (8/8)
- [x] 3.2 Integração (Postgres real): typo cria 0 users + 0 audits (8/8)

## 4. Gates

- [x] 4.1 `pytest` unit + integração do bootstrap, `ruff`, `mypy`, `bandit -ll` (verdes 2026-09-17)
- [x] 4.2 `git status` só escopo; sem segredos; sem commit sem pedido
