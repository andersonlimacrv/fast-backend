## 1. Mapear + reproduzir (TDD)

- [x] 1.1 Reproduzir: `.env` customizado (TTL, `TENANCY_MODE`, `BILLING_ENABLED`, CORS/hosts) → documentar quais testes quebram hoje.
  - Evidência (2026-09-17, `.env` com `TENANCY_MODE=row`, `BILLING_ENABLED=true` sem secret, `TRUSTED_HOSTS`/`CORS_ORIGINS` não-JSON, `ARGON2_*` e TTL customs): **21 failed + 25 errors** no `-m unit` (ex.: todo `Settings(secret_key=...)` nu virou `SettingsError`/`ValidationError`; `test_settings_validation` inteiro contaminado; `test_bootstrap_cli` quebrou). Sem `.env`: 85 passed + 1 falha pré-existente alheia (`test_new_project::test_bootstrap_tree`, arquivo `.git` de worktree copiado — fora do escopo, `scripts/new_project.py` é runtime).
- [x] 1.2 Fechar a lista dos sensíveis (ponto de partida: tabela no design).
  - Lista final = a do item 3.3 + `test_settings_validation.py` (`test_reset_ttl_bounds` e `test_csv_lists_accepted` falhariam sem `frontend_url` após remover o `setdefault`; `bootstrap/tenancy` ganharam `frontend_url` por robustez). `test_bootstrap_cli` já tinha `frontend_url`; `test_bootstrap_root.py:66-73` usa `monkeypatch.setenv` (compatível, sem alteração).

## 2. Spike obrigatório

- [x] 2.1 Validar se `Settings(_env_file=None)` ignora o dotenv mas honra `os.environ` limpo + `init kwargs`.
  - Resultado: SIM para dotenv+init+env (prioridade init > env mantida), NÃO para `os.environ` sujo (TTL=777 vazou) → resposta à Open Question do design: **precisa dos dois (clear + no-dotenv)**.
- [x] 2.2 Posição do `autouse`: não quebrar detecção `HOST_NET` (`conftest.py:39-47`) nem `POSTGRES_IMAGE`/`REDIS_IMAGE` (`:52-54`, lidos no import).
  - `HOST_NET`/imagens/`DOCKER_BIN` lidos no import (antes de qualquer fixture) → a fixture **não retroage o import**; allowlist os preserva (`POSTGRES_IMAGE=x pytest` continua valendo; `TESTCONTAINERS_*` lido no start). `base_settings` declara dependência explícita da fixture hermética para blindar a ordem entre fixtures de sessão.

## 3. Fixture hermética (`conftest.py`)

- [x] 3.1 `autouse`: allowlist + clear env + sem dotenv do repo (técnica do spike).
  - Escolha do spike: **`model_config["env_file"] = None` (restaurado no teardown) em vez de `chdir tmp_path`** — sem efeitos colaterais de cwd (storage relativo, `test_new_project` por `__file__`, `test_env_check` com paths explícitos). Fixture de sessão `_hermetic_suite_env` (session cobre `base_settings`/`containers`; function chegaria tarde demais para fixtures de sessão). Allowlist: `POSTGRES_IMAGE`/`REDIS_IMAGE`/`DOCKER_BIN`/`FB_TEST_NETWORK`/`CI` exatos, prefixos `TESTCONTAINERS_`/`DOCKER_`/`CI_`/`UV_`, + `PATH` and co. do SO (`PATHEXT`, `SYSTEMROOT`, `WINDIR`, `HOME`, `TEMP`/`TMP`, `SSL_*`, `PYTHON*`, `VIRTUAL_ENV`, etc.).
- [x] 3.2 `base_settings` com `frontend_url` explícito; remover `setdefault` de `:33`.
- [x] 3.3 Adaptar sensíveis: unit com `Settings` nu (`test_security_headers`, `test_jwt`, `test_meta`, `test_healthz`, `test_hashing`, `test_email`, `test_storage_local`, `test_tenant_repository`, `test_request_id`), integration com overrides parciais (`test_auth_flows`, `test_billing`, `test_readiness`, `test_tenant_isolation`, `test_outbox`, `test_email_smtp`, `test_storage_s3`, `test_password_recovery`, `test_leak_audit`), CLI/bootstrap (`test_bootstrap_cli`, `test_bootstrap_root.py:66-73`).
  - Todos os `Settings(...)` nus ganharam `frontend_url="https://app.example.com"` (https, para nunca esbarrar na validação de produção). `test_bootstrap_cli`/`test_bootstrap_root` **sem alteração** (já isolados). Runtime intacto (`app/main.py`, worker, migrations, `scripts/*`), validadores e pins de imagem intocados; `client/` intocado.

## 4. Gates

- [x] 4.1 Matriz do aceite 1 verde (com e sem `.env` custom).
  - unit sem `.env`: 85 passed (+1 falha pré-existente `test_new_project`, idêntica ao baseline pré-change). unit com `.env` hostil (row + billing sem secret + hosts/CORS não-JSON + ARGON2/TTL customs): **85 passed** (antes: 21 failed + 25 errors). unit com `.env.example` copiado e com customs JSON-válidos: 85 passed. integration (bridge, Postgres+Redis reais) sem `.env`: **69 passed**; com `.env` hostil: **69 passed**. Fail-fast `FRONTEND_URL` verificado (vazio/default continua rejeitado). Nota de ambiente: `FB_TEST_NETWORK=host` **não funciona no Docker Desktop Windows** (`--network host` não publica no host Windows; `test containers not ready`) — bridge é o modo correto aqui; Ryuk já é auto-desabilitado no Windows pelo conftest.
- [x] 4.2 `ruff check app scripts`, `ruff format --check`, `mypy app scripts`.
  - `ruff check`: pass. `ruff format --check`: pass (4 arquivos reformatados: conftest + 3 units). `mypy app scripts`: `Success: no issues found in 153 source files`.
- [x] 4.3 `tester` com Postgres real para os testes de tenancy que a fixture tocar.
  - `test_tenant_isolation.py` (4 testes: IDOR list/get/update/delete, row-mode 403, single-mode, superuser explícito) verde com Postgres real nas duas pernas da matriz (sem/com `.env`).
