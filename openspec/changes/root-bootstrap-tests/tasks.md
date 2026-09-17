# root-bootstrap-tests — tasks

## S0 — Change (esta change)

- [x] 0.1 `openspec/changes/root-bootstrap-tests/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Unit sem DB (eu)

- [x] 1.1 `app/tests/unit/test_bootstrap_cli.py`: chave errada/vazia, email vazio, senha curta, parse de args/env (5 testes)

## S2 — Integração com containers (eu)

- [x] 2.1 `app/tests/integration/test_bootstrap_root.py`: sucesso (flags + audit `root.bootstrap`), root-existente recusa, email-tomado recusa, `amain` ponta a ponta (4 testes)

## S3 — Verificação (eu)

- [x] 3.1 **APRESENTAR ao dono ANTES de fechar** (ordem permanente)
- [x] 3.2 Gates: markers unit/integration verdes, `ruff`+`mypy` (+`format`)
- [x] 3.3 Commitado (lote env/auth)
