## Why

`scripts/bootstrap_root.py` não tem nenhum teste — e a falha que o dono
encontrou ao vivo (7 tentativas, 3 causas indistinguíveis) prova a lacuna:
gates de chave, email, root-existente e caminho feliz nunca foram exercitados.
Cobertura aqui protege o fluxo que promove o primeiro staff.

## What Changes

- `app/tests/unit/test_bootstrap_cli.py` (sem DB): chave errada/vazia recusada
  antes de tocar o banco; email vazio e senha curta retornam 1 sem getpass
  real (monkeypatch); `parse_args` lê `--email/--key` e `ROOT_EMAIL`/`BOOTSTRAP_KEY`.
- `app/tests/integration/test_bootstrap_root.py` (testcontainers, `clean_db`):
  sucesso cria superuser+staff e registra `root.bootstrap` no audit;
  segundo bootstrap recusa; email já registrado recusa; `amain` completo com
  getpass mockado e `DATABASE_URL`/`FRONTEND_URL` via env.
- Sem mudança de comportamento do script (só cobertura).

## Capabilities

### New Capabilities

- `root-bootstrap-tests`: bootstrap coberto (unit sem DB + integração real).

## Impact

- 2 arquivos de teste (+ fixtures existentes `clean_db`/`containers`).
  Zero `app/` produtivo; zero compose/Makefile.

## Non-goals

- Mudar mensagens/comportamento fail-closed; e2e do bootstrap; commit sem pedido.

## Acceptance criteria

1. `pytest -m unit` + bootstrap files verdes sem Docker.
2. `pytest -m integration` do arquivo novo verde com containers.
3. `ruff`/`mypy` limpos nos arquivos tocados.
