## 1. Organization module

- [x] 1.1 Models `Organization`/`Membership` + migration `0002_organization_tenancy` + `alembic upgrade head` green
- [x] 1.2 `OrganizationService` (create/add/remove/change-role/last-owner guard/slug uniqueness) + `public.py` + router `/organizations`
- [x] 1.3 Tests: create→owner, member-add 403, last-owner 409, slug collision retry

## 2. Tenancy enforcement

- [x] 2.1 `modules/tenancy/` (`CurrentTenant`, `TenantScopedRepository`, `SuperuserContext`, `TENANCY_MODE` handling)
- [x] 2.2 Switch-organization via `organization.public.assert_membership` (403 sem membership) + atualizar teste existente
- [x] 2.3 Tests: tenant isolation IDOR (list/get/update/delete, Postgres real) + repository-sem-tenant falha + superuser explícito

## 3. Gate + verify

- [x] 3.1 `lint-imports` verde com os novos módulos (DAG)
- [x] 3.2 `ruff + mypy + pytest + bandit + pip-audit + gitleaks` verdes; request `/opsx-verify`
