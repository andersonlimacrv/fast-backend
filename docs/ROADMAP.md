# ROADMAP — fast-backend (fonte da verdade, v3)

> Alinhado à referência congelada `references/implementation_v2.md` + `docs/RULES.md` + `docs/adr/*`.
> Nomenclatura congelada: `CORE_MODULES`. Dir da aplicação: `app/` flat (ADR 0004). Estado: **v1.0.0 entregue** (tag `0.1.0`), Fases 0–11 concluídas, 150 testes backend (85 unit + 65 integration, Postgres/Redis reais) + 71 vitest e 10 Playwright em `client/`, 37 capabilities. Novas fases exigem nova change OpenSpec.

## Fase 0 — Baseline repo (concluída)

- [x] `AGENTS.md` + `docs/RULES.md` + `docs/adr/0001-0004` + 6 agentes (incl. `security-auditor`) + `opencode.json` endurecido
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
- [x] `oss-professional` implementada, verificada e arquivada (`2026-09-11-oss-professional`)

Saída (atingida): repo planejado e implementado — `app/`, `Dockerfile`, composes, `.env.example`, 8 changes arquivadas.

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

Aceite: webhook 3x → 1 efeito; core funciona com `BILLING_ENABLED=false` (flag, sem runtime de módulos plugáveis).

## Fase 8 — CI/CD + Template + Docs finais ✅

Pipeline `PR → ruff → mypy → unit → integration → security → build`; prod `build:sha → push → deploy VPS → migrate (expand/contract) → healthcheck → traffic`; rollback p/ imagem anterior. Docs finais: `README.md` operacional, `docs/DEPLOYMENT.md` (runbook), `CHANGELOG.md`, ADRs; bootstrap de 2º projeto via `scripts/new_project.py` (testado).

## Fase 9 — Admin Control Plane + Recovery ✅

`A-admin-control-plane` (root one-shot via CLI + `BOOTSTRAP_KEY`, `is_staff`, módulo folha `admin/` com endpoints-ação, `reason+success` em `audit.metadata`, ADRs 0005) → `B-password-recovery` (token opaco single-use, boundary event, force-reset administrativo, Mailpit, ADR 0006) → `C-social-contract` (contrato + tabela, flag off, ADR 0007). Specs: `admin`, `recovery`, `social-contract` em `openspec/specs/`. Suite: 122 testes (60 unit + 62 integration, Postgres/Redis reais).

## Fase 10 — Landing pública, two-step login e LGPD ✅

`backend-release-meta` (`GET /meta` allowlist + `APP_VERSION`, ADR 0008) → `client-landing-home` (`/` pública com fallback offline, home logada em `/~`, capability `client-landing`) → `two-step-login` (`LoginForm` always-advance + modal, dummy Argon2, ADR 0009, capability `two-step-login`) → `lgpd-leak-audit` (`docs/PRIVACY.md` +pt-BR, seção anti-enumeração em `SECURITY.md` +pt-BR, `test_leak_audit.py`, skills Vercel pinadas; capabilities `privacy-docs`, `leak-audit-tests`).

## Fase 11 — Dev loop, env-check e reformulação client ✅

`make-dev-loop` (`make dev`/`dev-down`, spec `dev-loop`) → `make-env-check` (`scripts/env_check.py` + `setup` encadeado, spec `env-validation`) → `client-reformulation` em 6 PRs (PR1 fundação: DESIGN.md + trio de agentes + Playwright; PR2 tokens; PR3 catálogo + Motion; PR4 base + RHF/Zod; PR5 páginas; PR6 auditoria total; capabilities `design-system-link`, `browser-e2e`, `client-landing`, `two-step-login`) → `docs-release-audit` (sync de documentação). ADR 0010 (remoção de `references/Makefile` com override).

## Fase 12 — Sidebar rica, shell e isolamento e2e (merge `#12` em `main`; higiene 2026-09-17 arquivada, WIP residual abaixo)

Sidebar DEMO (client changes `client/openspec/changes/{sidebar-demo,client-routing-structure,custom-ui-restructure,playground}` + base `design-unification,animate-ui-adoption`): triggers/avaliação por rota, grupo Projects tenant-scoped (count, mini-avatares, actions, rail abre menu), Organizations com subpastas, Settings placeholder, `/projects/new`, shell full-width com breadcrumb no header, tabelas com colunas prioritárias, scrollbar por tokens. Arquivadas em 2026-09-17: `design-unification`, `animate-ui-adoption`, `client-routing-structure`, `custom-ui-restructure` (em `client/openspec/changes/archive/`). Infra: `e2e-isolated-db` (`make e2e-full`, banco/API/preview dedicados — e2e não polui mais o dev), `root-bootstrap-tests` (unit sem DB + integração) — ambas arquivadas em `openspec/changes/archive/2026-09-17-*`. `FRONTEND_URL` obrigatório (fail-fast), `env-check` em tabela com segredos mascarados. WIP residual: `sidebar-demo` S7.2–S7.4 (ok visual do dono) + `playground` S1.3–S1.4 e fila S2+. Suite atual verificada: 155 testes backend + 102 vitest + 16 Playwright (contagens vivas no CHANGELOG; prosa não hardcodifica — ver regra anti-drift proposta na consolidação de docs).

## Futuro registrado (implementação futura, por prioridade do dono)

1. **`superuser-coverage`**: cobertura dedicada da implementação `is_superuser` — escalação grant/revoke staff (só root), `RequireStaff` nas rotas admin, `SuperuserContext` vs tenant comum, bootstrap one-shot, auditoria `root.bootstrap`.
2. **Suite hermética**: isolar `.env` real no `conftest` (testes hoje leem o `.env` do dev; chaves customizadas balançam testes que assumem ausência).
3. **Docs**: consolidação aprovada pendente (datas/contagens com carimbo, errata `review-design`, dobrar `CLIENT-STRUCTURE` no `ARCHITECTURE`, regra anti-drift em `RULES`).

## Gates de verificação (comandos atuais)

```bash
uv sync --extra dev
uv run alembic upgrade head && uv run pytest -m "unit"
uv run pytest -m "integration"
FB_TEST_NETWORK=host uv run pytest   # onde bridge Docker é bloqueada
uv run ruff check app scripts && uv run ruff format --check app scripts
uv run mypy app scripts && uv run lint-imports
uv run bandit -r app scripts -q -ll && uv run pip-audit && gitleaks detect --source . --no-git
```
