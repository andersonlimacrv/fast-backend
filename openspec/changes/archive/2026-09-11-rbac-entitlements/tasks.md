## 1. Entitlements module

- [x] 1.1 Model `EntitlementGrant` + migration `0003_entitlements` + `DEFAULT_ENTITLEMENTS` + `EntitlementDeniedError` → 403
- [x] 1.2 `require_entitlement(key)` dep + grants router (`GET/PUT /organizations/{id}/grants`, `admin+`) + `public.py`
- [x] 1.3 `require_role(minimum)` em `tenancy/public` + testes de unidade das deps

## 2. Gating de exemplo em projects

- [x] 2.1 `POST /projects` debita `projects.max`; `DELETE /projects/{id}` exige `admin+`
- [x] 2.2 Tests: member-delete 403, quota 201→403, flag-off 403, grants admin-only, defaults intactos

## 3. Gate + verify

- [x] 3.1 `lint-imports` verde (entitlements no DAG)
- [x] 3.2 `ruff + mypy + pytest + bandit + pip-audit + gitleaks` verdes; request `/opsx-verify`
