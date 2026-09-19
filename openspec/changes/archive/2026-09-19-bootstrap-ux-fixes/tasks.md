## 1. Change (esta change)

- [x] 1.1 `openspec/changes/bootstrap-ux-fixes/{proposal,tasks,design}.md` + pedido do dono (verificação + senha 2x)

## 2. Diagnóstico (evidência antes de código)

- [x] 2.1 Banco com 0 linhas após o run do dono; `args.key == ""` com `Settings().bootstrap_key` em 64 chars (chave nunca chega ao `argv`/env)

## 3. Implementação

- [x] 3.1 `amain`: duplo `getpass` (mismatch/curta → genérico, exit 1, sem DB)
- [x] 3.2 `Makefile`: `BOOTSTRAP_KEY` do `$(ENV_FILE)` + `ROOT_EMAIL` obrigatório com uso (uso validado ao vivo)
- [x] 3.3 `CHANGELOG.md` `[Unreleased]` + docs da change 1 atualizadas (sem export manual)

## 4. Testes

- [x] 4.1 Unit sem DB: mismatch → 1; match válido passa do gate (mock `bootstrap`; 10/10)
- [x] 4.2 Integração: divergência cria 0 users + 0 audits (Postgres real; 9/9)

## 5. Gates

- [x] 5.1 `pytest` unit + integração do bootstrap, `ruff`, `mypy`, `bandit -ll` (verdes 2026-09-19)
- [x] 5.2 `git status` só escopo; sem segredos; sem commit sem pedido
