## Why

O pin PG16→PG17 quebrou o CI: o job `integration` usa o `pg_dump` do runner (`ubuntu-latest` → client 16 em `/usr/bin/pg_dump`) contra o servidor PG17 do testcontainers, e `pg_dump` aborta em mismatch de major. Local passou porque a máquina tem client 17.11. Regra aplicável: `docs/RULES.md §10` (pin major.minor, fonte única).

## What Changes

- `.github/workflows/ci.yml`, job `integration`: instala `postgresql-client-17` via repositório PGDG antes de `make test-integration` (mesmo padrão do step `gitleaks` pinado do job `security`).

## Capabilities

### Modified Capabilities

- `deployment`: CI instala client PG na mesma major do `POSTGRES_IMAGE`.

## Impact

- Só CI; nenhum runtime, compose ou teste muda. `+~30s` no job integration.

## Non-goals

- Dockerizar o pg_dump; matriz de majors; cache apt.

## Acceptance criteria

1. Push na `main` → job `integration` verde com `test_backup_restore_drill` passando.
2. `git status` só com `.github/workflows/ci.yml` + esta change.
