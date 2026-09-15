## 1. Settings + env + erros

- [ ] 1.1 `settings.py`: `bootstrap_key=""`, `admin_enabled=true` + validação prod (key ≥32 quando setada; admin sem audit → falha-fechada documentada) + unit tests
- [ ] 1.2 `core/errors.py`: `LastRootProtectedError` + `interfaces/errors.py`: 409 + `.env.example` sem segredos

## 2. Identity: flags globais (sem quebrar auth)

- [ ] 2.1 Migração `0006_admin_staff` (coluna, CHECK, índice parcial) + `User.is_staff` + `Principal.is_staff`
- [ ] 2.2 `AuthenticationService`: `list_users`, `count_users`, `create_user_by_admin`, `set_active`, `set_staff`, `count_superusers` + `public.py` wrappers + unit/integration tests

## 3. Tenancy/RBAC: regressão de isolamento

- [ ] 3.1 Paths de tenant existentes continuam 403/404 cross-org com Postgres real (suite Fase 3 verde, sem alteração)

## 4. Superfícies aditivas para o admin (via public.py)

- [ ] 4.1 `OrganizationService`: `list_organizations`, `count_organizations` + public
- [ ] 4.2 `ProjectService`: `list_all`, `count_all(superuser)` via `scoped_for_superuser` + public
- [ ] 4.3 `AuditService`: `list_recent(limit)` (leitura global; rota guarda root) + public export

## 5. Módulo folha `app/modules/admin/`

- [ ] 5.1 Scaffold `__init__, policies (puras, unit), dependencies (require_staff/require_root, AdminContext), schemas (sem is_*), service, router (/admin/* com reason), public`
- [ ] 5.2 Contrato `import-linter admin-internals-private` + `admin` nas sources dos demais + `main.py` wiring sob flag
- [ ] 5.3 `scripts/bootstrap_root.py` (argparse+getpass+compare_digest, exit≠0, audit `root.bootstrap`) + `make admin-bootstrap` + `.PHONY`

## 6. Testes (Testcontainers, nunca mock)

- [ ] 6.1 Unit: policies puras, validação settings/env
- [ ] 6.2 Integration: bootstrap single-root (serviço+índice), matriz RBAC completa, invariantes (staff↛staff, último root 409), `reason+success` em metadata, falha-fechada sem audit
- [ ] 6.3 E2E `scripts/e2e_spa_flow.py` continua verde (sem regressão)

## 7. Docs da change

- [ ] 7.1 `specs/admin/spec.md` (delta) + ADR 0005 → revisado
- [ ] 7.2 `SKILLS-REGISTRY.md` triagem SQLAdmin/CRUDAdmin (`avaliadas`) + `DEPLOYMENT.md` (+pt-BR) runbook bootstrap + `CHANGELOG.md`
- [ ] 7.3 `openspec verify` 3 dimensões antes de `archive`

## 8. Gates

- [ ] 8.1 `ruff + mypy + lint-imports` verdes
- [ ] 8.2 `pytest -m unit` + `-m integration`
- [ ] 8.3 `bandit -ll` zero Medium+ + `pip-audit` + `gitleaks`
