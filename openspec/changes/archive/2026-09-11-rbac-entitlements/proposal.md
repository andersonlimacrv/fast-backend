## Why

Tenancy existe mas qualquer membro faz tudo e não há gating por plano/feature: sem `require_role`/`require_entitlement`, billing futuro não teria onde se plugar e operações sensíveis ficam abertas a `member` (v2 Top 10 #4, ADR 0003 — `entitlements` é core leve).

## What Changes

- `app/modules/entitlements/`: `EntitlementGrant{org_id, key, limit NULL, enabled}` (unique `org_id+key`), `DEFAULT_ENTITLEMENTS` em código (`projects.max=100`, `projects.access=true`) — DB sobrescreve código, nada precisa de seed (evita `organization → entitlements`, proibido pelo DAG), `require_entitlement(key)` dep (403 `EntitlementDeniedError` quando negado), grants router (`GET/PUT /organizations/{id}/grants`, só `admin+`).
- `require_role(minimum)` em `tenancy/public` (o papel mora no `TenantContext`; RBAC ≠ entitlement, ficam separados).
- `DELETE /projects/{id}` exige `admin+`; `POST /projects` debita `projects.max` (contagem < limite).
- Migration `0003_entitlements`. `EntitlementDeniedError` → 403.

## Capabilities

### New Capabilities

- `rbac`: `require_role` sobre o papel do `TenantContext`.
- `entitlements`: grants por org + defaults em código + `require_entitlement` + gating de exemplo em projects.

### Modified Capabilities

- (vazio)

## Impact

- Novos: `app/modules/entitlements/`, migration 0003, erro + mapping.
- Comportamento: `member` perde `DELETE /projects` (**BREAKING** intencional); orgs sem grants seguem pelos defaults (testes Fase 3 intactos).
- DAG: `entitlements → tenancy` (via `public`); `projects → entitlements` (folha); nenhum core importa opcionais.

## Non-goals (v2 §21)

Billing/Stripe (Fase 7 alimenta grants), papéis customizáveis, convites, auditoria de grants (Fase 6).

## Acceptance criteria (Postgres real)

1. `member` em `DELETE /projects/{x}` → 403; `admin` → 204.
2. Com grant `projects.max=1`: 1º create → 201, 2º → 403; sem grants (defaults) → 201.
3. Grant `projects.access=false` → qualquer operação do recurso → 403.
4. Grants router: `member` → 403; `admin` upsert+list ok.
5. `lint-imports` verde (entitlements abaixo de tenancy no DAG).
