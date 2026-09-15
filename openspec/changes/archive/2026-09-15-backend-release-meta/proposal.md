## Why

A landing pública (`/`, change 2) precisa mostrar módulos, flags e versão do release a partir do backend — hoje não existe endpoint de metadados nem `APP_VERSION` (grep vazio em `app/`). Hardcodar no client duplicaria a fonte da verdade e desatualizaria.

## What Changes

- `GET /meta` público (sem auth) → `{app, version, modules:[{key, enabled}]}`; núcleo sempre `enabled:true` (identity, organization, tenancy, entitlements, projects, audit, health); `admin`/`billing` refletem as flags.
- `APP_VERSION` em Settings (default `"0.1.0"`; release workflow injeta da tag — tags são a verdade, skill `shipping-and-launch`).
- **Proibido no payload:** segredos, hosts internos, PII, status de deps (não repetir `/readyz`).

## Capabilities

### New Capabilities

- `release-meta`: endpoint público de metadados de release + versão configurável.

### Modified Capabilities

- `env-validation`: nova var `APP_VERSION` (não-vazia).

## Impact

- Novo: `app/interfaces/meta.py`, spec `release-meta`, ADR 0008, testes `test_meta.py`.
- Alterado: `settings.py`, `main.py` (registro do router), `.env.example`, `CHANGELOG.md`.
- Sem migração, sem auth, sem PII.

## Non-goals (v2 §21)

Status de deps, uptime, contadores, ambiente/topologia, qualquer dado pessoal ou segredo.

## Acceptance criteria

1. `GET /meta` 200 sem token, shape exato, `version == APP_VERSION`.
2. Body varrido contra `secret|token|db_|smtp|postgres|redis|email|host` → zero matches.
3. Flags refletem settings (`ADMIN_ENABLED=false` → `admin.enabled == false`).
4. Gates verdes (`ruff/mypy/lint-imports`, `pytest -m unit`, `bandit/pip-audit/gitleaks`).
