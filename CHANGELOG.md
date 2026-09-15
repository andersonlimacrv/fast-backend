# CHANGELOG — fast-backend

Format: delivered phases (Conventional Commits in git tell the fine-grained story).

> Version convention: tags and sections use the `v` prefix from here on (`v1.1.0`, …).
> The `0.1.0` section below is historical (tag `0.1.0` without prefix) and stays as is.

## [0.1.0] — 2026-09-11 — Complete SaaS kernel (Phases 0–8)

- **Phase 0**: repo, 6 agents, OpenSpec, ADRs 0001–0004, skills registry.
- **Phase 1** (`auth-foundation`): Argon2id/pwdlib, JWT HS256 10–15min, opaque Postgres refresh (rotation+reuse+`FOR UPDATE`), `tokens_valid_after`, throttling.
- **Phase 2** (`hardening`): headers/CORS/hosts, `/readyz`, env validation, 5→12 import-linter contracts, CI.
- **Phase 3** (`identity-organization-tenancy`): orgs/memberships, `CurrentTenant`, `TenantScopedRepository` + `SuperuserContext`, projects, membership-enforced switch.
- **Phase 4** (`rbac-entitlements`): `require_role`, code-default grants, projects gating.
- **Phase 5** (`email-storage-jobs`): `EmailSender` SMTP/Jinja2, local+S3 `ObjectStorage`, outbox + Taskiq.
- **Phase 6** (`audit-observability-backup`): append-only trail, request-id + logs, encrypted backup with drill.
- **Phase 7** (`billing-stripe`): idempotent HMAC webhook → grants, flag off.
- **Phase 8** (`release-template`): multi-stage Dockerfile, composes, worker, rollback deploy, `new_project.py`, runbook.

Tests: 98 (unit + real Postgres/Redis integration). Specs: 20 capabilities in `openspec/specs/`.

## [Unreleased] — Phase 9 — Admin Control Plane + Recovery (changes A/B/C)

- **A (`A-admin-control-plane`)**: `users.is_staff` + `CHECK (superuser ⇒ staff)` + partial index `uq_single_root`; CLI `scripts/bootstrap_root.py` (`make admin-bootstrap`, `BOOTSTRAP_KEY` constant-time, fail-closed, audited `root.bootstrap`); leaf module `app/modules/admin/` (policies pure, `AdminContext`, `require_staff/require_root`, action endpoints staff vs root, never `PATCH is_*`, `SuperuserContext(reason=...)` explicit); `reason+success` in `audit.metadata` (AdminAction via metadata, no new table); `LastRootProtectedError` → 409; `ADMIN_ENABLED` flag; 13th import-linter contract.
- **B (`B-password-recovery`)**: `password_resets{token_hash,expires_at,used_at}` hash-only, TTL 60min, `SELECT FOR UPDATE` single-use; `POST /auth/password/forgot` (always 202, throttled, no enumeration) → outbox `email.template` → worker renders/sends/redacts; `POST /auth/password/reset` boundary event (Argon2id + `tokens_valid_after` + refresh revoke + sibling invalidation); `POST /admin/users/{id}/force-password-reset` (`accepted`, no secret); `password_reset.*` templates (`StrictUndefined`); `LogEmailSender.send_template` never logs context; Taskiq `password.purge`; Mailpit dev via `make tools`.
- **C (`C-social-contract`)**: `core/contracts/social.py` Protocol + `linked_identities(provider,provider_sub)` unique, `SOCIAL_LOGIN_ENABLED=false`, no route (OAuth activation deferred with state+PKCE).

Docs: ADRs 0005–0007, `DEPLOYMENT` (+pt-BR) root/recovery runbook, `SKILLS-REGISTRY` triage (SQLAdmin/CRUDAdmin/email/OIDC as evaluated-only), `.env.example` vars without secrets.

## [Unreleased] — Landing, two-step login e LGPD (changes `backend-release-meta` → `lgpd-leak-audit`)

- **`backend-release-meta`**: `GET /meta` público `{app, version, modules:[{key, enabled}]}` (allowlist, sem segredos/hosts/PII) + `APP_VERSION` (default `"0.1.0"`, injetado da tag no release); teste anti-vazamento varrendo o body; ADR 0008.
- **`client-landing-home`**: landing pública `/` (versão/módulos/flags ao vivo de `/meta`, fallback estático offline, zero terceiros); home logada em `/~`; `Protected` sem sessão → `/`; `services/meta.ts` + `useMeta` + `Landing.tsx`; capability `client-landing`.
- **`two-step-login`**: `LoginForm` email-primeiro always-advance + `LoginModal` (Base-UI Dialog) na landing + `/login` two-step; dummy Argon2 no `login()` fecha oráculo de timing; `register` 409 documentado como tradeoff; ADR 0009; capability `two-step-login`.
