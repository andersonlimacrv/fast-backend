## 1. Decisão prévia (dono)

- [x] 1.1 `SuperuserContext.reason`: DECIDIDO — Opção B (manter default `reason="support"`, sem quebrar contrato; teste "todo uso admin passa `reason` explícito" em `test_tenant_repository.py`). Registrado em `design.md`.

## 2. Matriz HTTP por rota (`test_admin_control_plane.py`)

- [x] 2.1 Parametrizar root/staff/member/401 para `GET /admin/users`, `GET /admin/users/{id}`, `POST /admin/users`, `disable|enable|revoke-sessions|force-password-reset`, `staff/*/grant|revoke`, `GET /admin/organizations`, `POST|DELETE /admin/memberships`, `GET /admin/audit` (oráculo: `admin/router.py:31-203`).
- [x] 2.2 Completar `GET /admin/audit` (hoje só staff 403 / root 200): adicionar member 403 + 401.

## 3. Grant/revoke + auditoria

- [x] 3.1 `revoke`: staff→403, root→200 (não-root), self→403; revoke-de-root→409 pinado em service-level (`auth.set_staff` → `LastRootProtectedError`, `identity/service.py:258-259`) + `_status_for==409` — via HTTP é inalcançável (single-root).
- [x] 3.2 Self-grant/self-revoke HTTP→403 (`admin/service.py:112,121`).
- [x] 3.3 Auditoria `admin.staff_revoked` com `reason+success` (espelho de `admin.user_create` em `:99-104`).

## 4. SuperuserContext vs comum

- [x] 4.1 Negativo com Postgres real: tenant comum não lê cross-tenant (já coberto em `test_tenant_isolation.py:21-42` — pinar) e não instancia bypass implícito.
- [x] 4.2 Positivo: bypass explícito lê cross-tenant (já coberto em `:81-92` — pinar) + todo uso admin passa `reason` explícito (grep/varredura + assert), ou `reason` obrigatório (conforme 1.1).

## 5. Bootstrap fino (`test_bootstrap_root.py`)

- [x] 5.1 Stdout genérico: não revela key-vs-exists (`bootstrap_root.py:31,78-89`).
- [x] 5.2 Senha curta → exit 1 (`:80-82`); metadata `{"success": True}` (`:52-59`); 2ª tentativa não cria 2º audit.

## 6. 409 estrito + gates

- [x] 6.1 Eliminar `in (403,409)` frouxo: staff-desabilita-único-root → `==409`; self-disable → `==403` (`assert_not_self` precede o guard); sem rota PATCH → `==405`.
- [x] 6.2 Unit `_status_for(LastRootProtectedError)==409` (`core/errors.py:40-41`, `interfaces/errors.py:40-41`).
- [x] 6.3 Gates: `pytest -m unit`, `pytest -m integration` (ou `FB_TEST_NETWORK=host`), `ruff check`, `mypy`; sem mock de repository como prova de isolamento.
