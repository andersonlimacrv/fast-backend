## Why

O bootstrap aceita qualquer string como email (`canonical_email` em `service.py:37-38` só faz strip+lower): `ROOT_EMAIL=andersonlimacrv` (sem `@`) seria gravado literalmente — e como o bootstrap é one-shot (`uq_single_root`), um typo no email do root é quase permanente (só via SQL). Provado na prática em 2026-09-17.

## What Changes

- `scripts/bootstrap_root.py`: `validate_root_email()` pura (formato via `email-validator`, já dependência em `pyproject.toml:18`, com `check_deliverability=False` — sem DNS, sem rede, sem vazar o email); chamada em `bootstrap()` após o gate da chave e antes de qualquer I/O de banco; inválido → `ValueError(GENERIC_FAILURE)` (fail-closed genérico preservado, sem oráculo novo).
- Testes: unit sem DB (formatos inválidos recusados antes do banco; válido passa do gate) + integração (typo cria 0 users / 0 audits).

## Capabilities

### New Capabilities

- Nenhuma (hardening do CLI).

### Modified Capabilities

- `admin`: bootstrap exige email válido.

## Impact

- Alterados: `scripts/bootstrap_root.py`, `app/tests/unit/test_bootstrap_cli.py`, `app/tests/integration/test_bootstrap_root.py`.
- Serviço (`create_superuser`) e HTTP intactos — o `register` já valida via `EmailStr`; o buraco era só o caminho CLI.

## Non-goals

Validar deliverability/DNS, normalizar o email além do serviço (serviço segue canônico), mudar mensagens fail-closed.

## Acceptance criteria

1. `ROOT_EMAIL` sem `@` → `bootstrap failed`, exit 1, 0 linhas em `users`/`audit_log`.
2. Email válido + key correta → root criado como antes (sem regressão).
3. `pytest` unit + integração do bootstrap, `ruff`, `mypy`, `bandit -ll` verdes.
