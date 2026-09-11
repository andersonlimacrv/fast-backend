## Why

Auth existe mas o SaaS ainda é single-user: sem organização, sem vínculo usuário↔org e sem isolamento entre tenants — pré-requisitos de RBAC, entitlements e billing (v2 Top 10 #2–3, ADR 0002/0003). Sem isso agora, todo schema futuro vira migration dolorosa.

## What Changes

- `app/modules/organization/`: `Organization{id,name,slug}`, `Membership{user_id,org_id,role}` (roles fixos `owner|admin|member`), service (`create_organization`, `add_member`, `remove_member`, `change_role`, `get_user_orgs`), router (`/organizations`, `/organizations/{id}/members`), `public.py` (`get_membership`, `assert_membership`, `list_user_orgs`) — única superfície p/ outros módulos (v2 §4, ADR 0003).
- `app/modules/tenancy/`: `CurrentTenant` (resolve `active_org_id` do JWT → valida membership no Postgres → 403/404), `TenantScopedRepository` (construtor exige `tenant_id`; nenhum método padrão lê sem filtro), `SuperuserContext` (bypass explícito p/ admin) (v2 §4.1–4.3).
- **Modificação de comportamento existente**: `POST /auth/switch-organization` passa a exigir membership (403 se não-membro); antes emitia para qualquer `org_id`.
- Migration Alembic `0002_organization_tenancy`.
- `TENANCY_MODE` respeitado: `single` resolve contexto automaticamente; `row` exige `active_org_id` + membership.

## Capabilities

### New Capabilities

- `organizations`: orgs, memberships e roles fixos.
- `tenancy`: `CurrentTenant`, `TenantScopedRepository`, `SuperuserContext`, modos `single|row`.

### Modified Capabilities

- `jwt-access`: `switch-organization` agora exige membership (403 caso contrário). Delta em `specs/jwt-access/spec.md`.

## Impact

- Novos: `app/modules/organization/`, `app/modules/tenancy/`, migration 0002, `OrganizationService`/`MembershipService`.
- **BREAKING intencional**: switch para org sem membership → 403 (antes 200).
- DAG respeitado: `organization → identity` (via `public.get_user_by_id`), `tenancy → organization`; `identity` intocado.

## Non-goals (v2 §21)

RBAC enforcement por recurso (Fase 4), convites por email (Fase 5), RLS, schema/database-per-tenant, papéis customizáveis.

## Acceptance criteria (Postgres real, nunca mock)

1. Criar org → criador vira `owner`; adicionar membro → `member`; sem membership → 403 em rotas da org.
2. Tenant isolation (v2 §4.5): usuário da org A lista recursos → nada da org B; `GET /resources/{id-B}` → 403/404 — cobrindo list/get/update/delete.
3. `switch-organization` sem membership → 403; com membership → novo access com `active_org_id`.
4. `TenantScopedRepository` sem `tenant_id` não instancia (TypeError/ValueError); `SuperuserContext` lê cross-tenant explicitamente.
5. `lint-imports` continua verde (DAG).
