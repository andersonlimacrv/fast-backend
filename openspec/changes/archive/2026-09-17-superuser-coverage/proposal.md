## Why

O control plane admin (`A-admin-control-plane`, ADR 0005) está implementado e coberto por testes, mas a cobertura é parcial e frouxa em pontos críticos: `revoke` de staff não tem nenhum assert HTTP (só `grant`), a matriz RBAC completa existe só para `GET /admin/overview`, `SuperuserContext` aceita `reason` com default (`"support"`) — ou seja, "bypass sem reason falha" não existe na implementação — e o pin 409 de `LastRootProtectedError` aceita `403 ou 409` (assert frouxo em `test_admin_control_plane.py:138-150`). É o item 1 do Futuro registrado (`docs/ROADMAP.md`): sem suite dedicada, um bypass de `SuperuserContext` passa sem teste de regressão.

## What Changes

Só `app/tests/**` (test-only, sem comportamento novo, sem migração):

1. Complemento grant/revoke: `POST /admin/staff/{id}/revoke` (staff→403, root→200 sobre não-root, self→403), self-grant HTTP→403, auditoria `admin.staff_revoked` com `reason+success`. Revoke-de-root→409 pinado onde a guarda vive (service-level `auth.set_staff`, `identity/service.py:258-259`): via HTTP é inalcançável (single-root + self-precedence→403 + staff→403 por policy).
2. Matriz RBAC parametrizada por rota `/admin/*` (root 200, staff 200/403 conforme a rota, member 403, sem token 401) — incluindo `force-password-reset`, hoje sem teste RBAC dedicado.
3. `SuperuserContext` vs tenant comum com Postgres real + decisão explícita sobre o default de `reason` (ver design.md).
4. Bootstrap: stdout genérico (não revela key vs exists), senha curta → exit 1, segunda tentativa não cria 2º audit, metadata `{"success": True}`.
5. 409 estrito: trocar `in (403,409)` por `==409` + unit de `_status_for(LastRootProtectedError)`.

## Capabilities

### New Capabilities

- Nenhuma (higiene de suite).

### Modified Capabilities

- `admin`: suite dedicada de `is_superuser` (sem mudança de contrato, salvo decisão do `reason` — ver abaixo).

## Impact

- Alterado: `app/tests/integration/test_admin_control_plane.py`, `app/tests/integration/test_bootstrap_root.py`, `app/tests/integration/test_tenant_isolation.py`, `app/tests/unit/test_admin_policies.py`, `app/tests/unit/test_tenant_repository.py` (+ unit novo de `_status_for` se necessário).
- `app/` runtime intacto, salvo se o dono decidir tornar `SuperuserContext.reason` obrigatório (quebra `tenancy/repository.py:13` + `admin/service.py:54` — nesse caso vira mudança de comportamento e exige complemento a esta change).

## Non-goals

UI admin, RLS, `PLATFORM_MODULES`, mudança em `is_staff`/índice `0006_admin_staff`, MFA (follow-up do RIPD).

## Acceptance criteria

1. Cada rota `/admin/*` tem matriz pinada (root/staff/member/401); `revoke` coberto nos 3 casos + auditoria.
2. `POST /admin/users/{root}/disable` por staff (não-root) → 409 estrito; self-disable → 403 estrito (`assert_not_self` precede o guard last-root em `admin/service.py:86`). Sem `in (403,409)` frouxo.
3. Decisão sobre o default de `reason` registrada (obrigatório ou explícito-por-convenção + teste que a garante).
4. Gates: `pytest -m unit`, `pytest -m integration` (Postgres real), `ruff`, `mypy` verdes.
