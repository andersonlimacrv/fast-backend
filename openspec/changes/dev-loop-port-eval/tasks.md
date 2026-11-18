# dev-loop-port-eval — tasks

## S0 — Change

- [x] 0.1 `openspec/changes/dev-loop-port-eval/{proposal,design,tasks}.md`

## S1 — Makefile: parsing das portas

- [x] 1.1 Substituir `$(eval $(ENV_PORTS))` por
      `$(foreach assignment,$(subst ;, ,$(ENV_PORTS)),$(eval $(assignment)))`
- [x] 1.2 Atualizar o comentário das linhas 23-29 (contrato `;` + fallback)

## S2 — Script: contrato documentado

- [x] 2.1 Corrigir o comentário de `scripts/env_ports.py:76-85` (quem separa é
      o Makefile; `;` é o transporte que sobrevive ao `$(shell)`)

## S3 — Guarda de deps do frontend

- [x] 3.1 Novo `_check-web-deps` (checa `node_modules/vite`, mensagem
      acionável) + `.PHONY`
- [x] 3.2 Adicionar como pré-requisito de `dev`, `web`, `web-lint`, `web-test`,
      `web-build`, `web-e2e-install`, `web-e2e`, `web-e2e-update`, `e2e-build`,
      `e2e-full`

## S4 — Teste de regressão

- [x] 4.1 `app/tests/unit/test_env_ports.py`: teste `make -n dev` com `.env`
      temporário (skip sem make/bash)
- [x] 4.2 Ajustar asserts do formato `--make` (sem newline; segmentos
      `KEY=valor`) e o comentário existente

## S5 — Docs

- [x] 5.1 `docs/Makefile.md` + `docs/Makefile.pt-BR.md` (novo check + parsing)
- [x] 5.2 `CHANGELOG.md` `[Unreleased]`

## S6 — Verificação

- [x] 6.1 `make -n dev` limpo (3001/8001; overrides 4000/9000 respeitados);
      `make _check-web-deps` ok e falha acionável com `CLIENT_DIR` inexistente
- [x] 6.2 `make env-check` OK; `uv run pytest -m unit` 152 passed;
      `ruff check` + `ruff format --check` verdes
- [x] 6.3 `make help`/`help-unclassified` OK; `git status --short`; sem commit
      sem pedido
