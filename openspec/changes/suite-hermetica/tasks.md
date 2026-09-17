## 1. Mapear + reproduzir (TDD)

- [ ] 1.1 Reproduzir: `.env` customizado (TTL, `TENANCY_MODE`, `BILLING_ENABLED`, CORS/hosts) → documentar quais testes quebram hoje.
- [ ] 1.2 Fechar a lista dos sensíveis (ponto de partida: tabela no design).

## 2. Spike obrigatório

- [ ] 2.1 Validar se `Settings(_env_file=None)` ignora o dotenv mas honra `os.environ` limpo + `init kwargs`.
- [ ] 2.2 Posição do `autouse`: não quebrar detecção `HOST_NET` (`conftest.py:39-47`) nem `POSTGRES_IMAGE`/`REDIS_IMAGE` (`:52-54`, lidos no import).

## 3. Fixture hermética (`conftest.py`)

- [ ] 3.1 `autouse`: allowlist + clear env + sem dotenv do repo (técnica do spike).
- [ ] 3.2 `base_settings` com `frontend_url` explícito; remover `setdefault` de `:33`.
- [ ] 3.3 Adaptar sensíveis: unit com `Settings` nu (`test_security_headers`, `test_jwt`, `test_meta`, `test_healthz`, `test_hashing`, `test_email`, `test_storage_local`, `test_tenant_repository`, `test_request_id`), integration com overrides parciais (`test_auth_flows`, `test_billing`, `test_readiness`, `test_tenant_isolation`, `test_outbox`, `test_email_smtp`, `test_storage_s3`, `test_password_recovery`, `test_leak_audit`), CLI/bootstrap (`test_bootstrap_cli`, `test_bootstrap_root.py:66-73`).

## 4. Gates

- [ ] 4.1 Matriz do aceite 1 verde (com e sem `.env` custom).
- [ ] 4.2 `ruff check app scripts`, `ruff format --check`, `mypy app scripts`.
- [ ] 4.3 `tester` com Postgres real para os testes de tenancy que a fixture tocar.
