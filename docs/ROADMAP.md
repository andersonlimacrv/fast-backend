# ROADMAP — fast-backend (fonte da verdade, v3)

> Alinhado à referência congelada `references/implementation_v2.md` + `docs/RULES.md` + `docs/adr/*`.
> Nomenclatura congelada: `CORE_MODULES`. Dir da aplicação: `app/` flat (ADR 0004). Estado: Fase 0. Sem `app/` sem OpenSpec change aprovada.

## Fase 0 — Baseline repo (ATUAL)

- [x] `AGENTS.md` + `docs/RULES.md` + `docs/adr/0001-0003` + 6 agentes (incl. `security-auditor`) + `opencode.json` endurecido
- [x] `docs/SKILLS-REGISTRY.md` (nada instalado sem registro + SHA)
- [x] `references/implementation_v2.md` congelada (nunca editar)
- [x] `openspec init` (config + skills `opsx:*`)
- [x] Change `auth-foundation` draftada em `openspec/changes/` (proposal+design+3 specs+tasks) — **aguardando sua aprovação**
- [x] ROADMAP v3 aprovado; `auth-foundation` implementada, verificada e arquivada (`2026-09-11-auth-foundation`)
- [x] `hardening` implementada, verificada e arquivada (`2026-09-11-hardening`)
- [x] `identity-organization-tenancy` implementada, verificada e arquivada (`2026-09-11-identity-organization-tenancy`)
- [x] `rbac-entitlements` implementada, verificada e arquivada (`2026-09-11-rbac-entitlements`)
- [x] `email-storage-jobs` implementada, verificada e arquivada (`2026-09-11-email-storage-jobs`)
- [x] `audit-observability-backup` implementada, verificada e arquivada (`2026-09-11-audit-observability-backup`)
- [x] `billing-stripe` implementada, verificada e arquivada (`2026-09-11-billing-stripe`)
- [x] `release-template` implementada, verificada e arquivada (`2026-09-11-release-template`)

Saída: repo planejado, nenhum `app/`, `Dockerfile`, `.env`.

## Fase 1 — Fundação de Auth ✅

Escopo (v2 §3): Argon2id/`pwdlib` (bcrypt só migração), JWT HS256 10–15min com `sub/type/iat/exp/iss/aud/jti/active_org_id`, refresh opaco Postgres `{token_hash,family_id,used_at,revoked_at,replaced_by}` com rotation + reuse→revoga family + **atomicidade (`FOR UPDATE`)**, `tokens_valid_after` (só em `CurrentPrincipal`), throttling (ip,email), logging mínimo + `/healthz`.

Aceite: rotation ok; concorrência A/B em R1 → só 1 vence; reuse de R1 → 401 e R2 morre; `tokens_valid_after` invalida access velho; throttling → 429. Testes Testcontainers, nunca mock.

## Fase 2 — Hardening ✅

Security headers, CORS por ambiente, `/readyz` (DB+Redis), validação de env, `import-linter` (DAG `identity→organization→tenancy→entitlements`) no CI, `bandit/pip-audit/gitleaks` limpos.

Aceite: CI falha em import proibido; env inseguro rejeitado.

## Fase 3 — Identity / Organization / Tenancy ✅

`modules/identity` (register/login/refresh/logout/change_password/invalidate_tokens, `public.py`), `organization`+`membership`, `CurrentTenant` + `TenantScopedRepository(tenant_id)` + `SuperuserContext` explícito. `TENANCY_MODE=single|row`; `active_org_id` contexto (autoridade = membership); troca via `POST /auth/switch-organization` emitindo novo access. Sem RLS.

Aceite: isolamento tenant list/get/update/delete + IDOR → `403/404` com Postgres real.

## Fase 4 — RBAC + Entitlements ✅

Papéis fixos owner/admin/member, `require_role`/`require_entitlement`. `entitlements` core leve (ex. `projects.max`, `ai.enabled`), funciona sem billing.

Aceite: sem membership → 403; sem entitlement → 403 mesmo sem Stripe.

## Fase 5 — Email + Storage + Jobs/Idempotência ✅

`EmailSender` (Jinja2+SMTP/`aiosmtplib`, Mailpit dev), `ObjectStorage` (local→MinIO→S3), Taskiq + `outbox_messages{id,type,aggregate_id,idempotency_key,payload,status,attempts}`. Idempotência = operação lógica única; sem exactly-once externo.

Aceite: mesma `idempotency_key` não agenda 2x; upload local sem MinIO; retry controlado.

## Fase 6 — Auditoria + Observabilidade avançada + Backup ✅

`audit_log{tenant_id,actor_user_id,action,resource_type,resource_id,metadata,ip,user_agent}` append-only (login, logout global, senha, membership/role, billing, entitlement, admin). Logs estruturados + `request_id` + erro centralizado; métricas/tracing proporcionais. Backup `dump→compress→encrypt→off-site` + restore drill.

Aceite: ação sensível auditável; restore em ambiente limpo reproduz o banco.

## Fase 7 — Billing Stripe (opcional) ✅

`PaymentProvider` + `StripePaymentProvider`; webhook → idempotência (`provider_event_id` unique) → billing → entitlements. Core funciona com `billing_stripe` desligado.

Aceite: webhook 3x → 1 efeito; desligar em `ENABLED_MODULES` não quebra core (CI com/sem).

## Fase 8 — CI/CD + Template + Docs finais ✅

Pipeline `PR → ruff → mypy → unit → integration → security → build`; prod `build:sha → push → deploy VPS → migrate (expand/contract) → healthcheck → traffic`; rollback p/ imagem anterior. Docs `architecture/development/deployment/modules/guides/adr`, README operacional, bootstrap de 2º projeto só pela doc.

## Comandos futuros (NÃO rodar na Fase 0)

```bash
uv sync --all-packages --all-extras
uv run alembic upgrade head && uv run pytest -m "unit"
uv run pytest -m "integration"
bandit -r app && pip-audit && gitleaks detect
```
