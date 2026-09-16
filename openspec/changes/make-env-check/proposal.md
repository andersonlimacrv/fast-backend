## Why

`.env` parado no tempo (hoje faltam 6 chaves: `APP_VERSION`, `ADMIN_ENABLED`, `BOOTSTRAP_KEY`, `PASSWORD_RESET_TTL_MINUTES`, `FRONTEND_URL`, `SOCIAL_LOGIN_ENABLED`) só aparece como erro obscuro em runtime. Falta um retorno legível do que diverge do `.env.example`, antes do `migrate`.

## What Changes

- `scripts/env_check.py` (stdlib): compara chaves `.env` × `.env.example` + sanidade de valores espelhando os validators de `Settings`. **Nunca imprime valores**, nunca escreve arquivos.
- `make env-check` (exit `0` ok / `1` drift ou valor inválido / `2` arquivo ausente); `setup` passa a rodá-lo entre `sync` e `migrate`.

## Capabilities

### New Capabilities

- Nenhuma (extensão de DX sobre validação existente).

### Modified Capabilities

- `env-validation`: além de falhar no boot inseguro, o repo reporta drift e forma inválida com nomes de chaves (sem valores).

## Impact

- Novo: `scripts/env_check.py`, `app/tests/unit/test_env_check.py`, delta de spec.
- Alterado: `Makefile` (`env-check`, `setup`, `.PHONY`), `docs/Makefile*.md`, `CHANGELOG.md` (1 linha).
- `dev` não muda; CI não muda (usa secrets, não `.env`).

## Non-goals (v2 §21)

`--sync`/escrita no `.env`, validação de segredos contra provedores, checagem de `client/.env` além de existência.

## Acceptance criteria

1. `.env` sem as 6 chaves → tabela lista exatamente elas + exit 1, sem nenhum valor impresso.
2. `SECRET_KEY` curta/default, `BOOTSTRAP_KEY` curta, `TENANCY_MODE` inválido → FALHA nomeando a chave, sem ecoar valor.
3. `make setup` falha cedo (antes de `migrate`) com `.env` incompleto.
4. Gates verdes + `openspec verify` antes de `archive`.
