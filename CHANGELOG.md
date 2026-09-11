# CHANGELOG — fast-backend

Formato: fases entregues (Conventional Commits no git contam a história fina).

> Convenção de versão: tags e seções usam prefixo `v` a partir daqui (`v1.1.0`, …).
> A seção `0.1.0` abaixo é histórica (tag `0.1.0` sem prefixo) e permanece como está.

## [0.1.0] — 2026-09-11 — Kernel SaaS completo (Fases 0–8)

- **Fase 0**: repo, 6 agentes, OpenSpec, ADRs 0001–0004, registry de skills.
- **Fase 1** (`auth-foundation`): Argon2id/pwdlib, JWT HS256 10–15min, refresh opaco Postgres (rotation+reuse+`FOR UPDATE`), `tokens_valid_after`, throttling.
- **Fase 2** (`hardening`): headers/CORS/hosts, `/readyz`, validação de env, 5→12 contratos import-linter, CI.
- **Fase 3** (`identity-organization-tenancy`): orgs/memberships, `CurrentTenant`, `TenantScopedRepository` + `SuperuserContext`, projects, switch com membership.
- **Fase 4** (`rbac-entitlements`): `require_role`, grants com defaults em código, gating em projects.
- **Fase 5** (`email-storage-jobs`): `EmailSender` SMTP/Jinja2, `ObjectStorage` local+S3, outbox + Taskiq.
- **Fase 6** (`audit-observability-backup`): trilha append-only, request-id + logs, backup criptografado com drill.
- **Fase 7** (`billing-stripe`): webhook HMAC idempotente → grants, flag off.
- **Fase 8** (`release-template`): Dockerfile multi-stage, composes, worker, deploy com rollback, `new_project.py`, runbook.

Testes: 98 (unit + integração Postgres/Redis reais). Specs: 20 capabilities em `openspec/specs/`.
