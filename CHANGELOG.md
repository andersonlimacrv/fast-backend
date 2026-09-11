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
