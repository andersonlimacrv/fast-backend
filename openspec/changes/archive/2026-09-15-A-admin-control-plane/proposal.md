## Why

O `/client` vai operar como admin central deste e dos próximos projetos, mas o backend v1.0.0 não tem control plane: `is_superuser` existe (`app/modules/identity/models.py:23`) sem autorização associada, não há bootstrap de root, nem gestão global de usuários. Criar privilegiados por SQL manual é inauditável e intestável. Referência: `references/implementation_v2.md` §4 (boundaries), §6 (tenancy/RBAC), §23 (decisões); ADRs 0001/0002/0003/0005.

## What Changes

- **Root one-shot via CLI + `BOOTSTRAP_KEY`**: `scripts/bootstrap_root.py` (`make admin-bootstrap`) cria o único `users.is_superuser=true` com `hmac.compare_digest`; 2ª tentativa falha fechada (transação + índice parcial `uq_single_root WHERE is_superuser`). Nenhum endpoint HTTP de bootstrap.
- **Hierarquia `root > staff > owner/admin/member`**: `is_superuser=root` global; nova coluna `users.is_staff` = admin central de escopo limitado; invariantes: `is_superuser ⇒ is_staff` (CHECK), só root gerencia staff/root, nunca remover/desabilitar o último root (`LastRootProtectedError` → 409, irmão de `LastOwnerProtectedError`).
- **Módulo folha `app/modules/admin/`** (`__init__, dependencies, policies, schemas, service, router, public`): consome só `*/public.py` + `core/contracts/*`; `AdminContext{user_id,level}` + `StaffContext`; `require_staff/require_root` — único lugar que lê `is_*` (nunca `if user.is_superuser` espalhado); bypass cross-tenant só via `SuperuserContext(reason=...)` explícito.
- **Admin ≠ CRUD — endpoints-ação explícitos** (nunca `PATCH {is_superuser:true}`): staff: `GET /admin/overview`, `GET /admin/users|/{id}`, `POST /admin/users` (cria usuário comum, sem flags), `POST /admin/users/{id}/disable|enable|revoke-sessions`, `GET /admin/organizations`, `POST /admin/memberships`, `DELETE /admin/memberships/{org_id}/{user_id}` (com proteção de último owner); root além disso: `POST /admin/staff/{id}/grant|revoke`, `GET /admin/audit` global. Mutação exige `reason` (≥8 chars).
- **AdminAction via metadata**: sem tabela nova; toda ação `admin.*` grava `audit.metadata={reason, success, ...}` (validado no service). Suspensão de org adiada (sem coluna de status — alternativa destrutiva rejeitada).
- **Settings/env**: `BOOTSTRAP_KEY` (≥32 em prod), `ADMIN_ENABLED=true` (folha opcional por flag, sem renomear `CORE_MODULES`); admin exige audit ativo (falha-fechada sem recorder).

## Capabilities

### New Capabilities

- `admin-bootstrap`: root único via CLI, falha-fechada, auditado (`root.bootstrap`).
- `admin-management`: gestão global por root/staff com policies, bypass explícito e `reason` auditado.

### Modified Capabilities

- `rbac`: níveis globais `staff|root` + `LastRootProtectedError`.
- `env-validation`: `BOOTSTRAP_KEY`, `ADMIN_ENABLED`.
- `audit`: ações `root.bootstrap`, `admin.*` com `reason+success` em metadata.
- `module-boundaries`: folha `admin` no DAG + contrato `import-linter`.

## Impact

- Novo: `app/modules/admin/**`, `scripts/bootstrap_root.py`, migração `0006_admin_staff` (`is_staff`, CHECK, `uq_single_root`), `GET|POST /admin/*`, métodos aditivos em identity/organization/projects/audit services + `public.py` (counts, listagens globais).
- Alterado: `settings.py`, `core/errors.py`, `interfaces/errors.py`, `identity` (Principal+`is_staff`), `main.py`, `pyproject.toml` (contracts), `.env.example`, `Makefile` (`admin-bootstrap`), `conftest.py` (TRUNCATE inalterado — sem tabela nova).
- Risco: single-root no DB impede multi-root sem migração (intencional, ADR 0005).

## Non-goals (v2 §21)

Sem UI dashboard (só contrato); sem recovery (change B); sem social (change C); sem impersonation; sem suspensão de org; sem endpoint de bootstrap; sem RLS/K8s/OTel; sem `PLATFORM_MODULES`.

## Acceptance criteria (Postgres+Redis reais via Testcontainers, nunca mock)

1. Bootstrap: 1ª execução key correta → exit 0 + root + audit; 2ª → exit≠0 sem 2º root; key errada → exit≠0 sem revelar existência.
2. RBAC: root 200 em tudo; staff 200 nas de staff e 403 nas de root; member 403; sem token 401.
3. Invariantes: staff não cria staff/root (403); desabilitar/revogar último root → 409; `PATCH` genérico de flags não existe (404 no contrato).
4. Auditoria: toda mutação `admin.*` tem `reason+success` em metadata; sem audit ativo, admin falha-fechada.
5. Gates: `ruff+mypy+lint-imports+pytest`, `bandit -ll` zero Medium+, `pip-audit`, `gitleaks` limpos.
