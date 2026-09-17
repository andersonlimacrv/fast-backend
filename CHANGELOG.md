# CHANGELOG — fast-backend

Format: delivered phases (Conventional Commits in git tell the fine-grained story).
Releases are automatic: every PR merged to `main` finalizes `[Unreleased]` into a version (see ADR 0011); never leave entries parked here.
An empty `[Unreleased]` below is the normal idle state — the bot (`auto_release.py --if-needed`) only cuts a release when a behavior change adds an entry; docs-only PRs pass the gate without one (see `release-check.yml`).

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

## [v0.1.1] — 2026-09-16

- **A (`A-admin-control-plane`)**: `users.is_staff` + `CHECK (superuser ⇒ staff)` + partial index `uq_single_root`; CLI `scripts/bootstrap_root.py` (`make admin-bootstrap`, `BOOTSTRAP_KEY` constant-time, fail-closed, audited `root.bootstrap`); leaf module `app/modules/admin/` (policies pure, `AdminContext`, `require_staff/require_root`, action endpoints staff vs root, never `PATCH is_*`, `SuperuserContext(reason=...)` explicit); `reason+success` in `audit.metadata` (AdminAction via metadata, no new table); `LastRootProtectedError` → 409; `ADMIN_ENABLED` flag; 13th import-linter contract.
- **B (`B-password-recovery`)**: `password_resets{token_hash,expires_at,used_at}` hash-only, TTL 60min, `SELECT FOR UPDATE` single-use; `POST /auth/password/forgot` (always 202, throttled, no enumeration) → outbox `email.template` → worker renders/sends/redacts; `POST /auth/password/reset` boundary event (Argon2id + `tokens_valid_after` + refresh revoke + sibling invalidation); `POST /admin/users/{id}/force-password-reset` (`accepted`, no secret); `password_reset.*` templates (`StrictUndefined`); `LogEmailSender.send_template` never logs context; Taskiq `password.purge`; Mailpit dev via `make tools`.
- **C (`C-social-contract`)**: `core/contracts/social.py` Protocol + `linked_identities(provider,provider_sub)` unique, `SOCIAL_LOGIN_ENABLED=false`, no route (OAuth activation deferred with state+PKCE).

Docs: ADRs 0005–0007, `DEPLOYMENT` (+pt-BR) root/recovery runbook, `SKILLS-REGISTRY` triage (SQLAdmin/CRUDAdmin/email/OIDC as evaluated-only), `.env.example` vars without secrets.

- **`backend-release-meta`**: `GET /meta` público `{app, version, modules:[{key, enabled}]}` (allowlist, sem segredos/hosts/PII) + `APP_VERSION` (default `"0.1.0"`, injetado da tag no release); teste anti-vazamento varrendo o body; ADR 0008.
- **`client-landing-home`**: landing pública `/` (versão/módulos/flags ao vivo de `/meta`, fallback estático offline, zero terceiros); home logada em `/~`; `Protected` sem sessão → `/`; `services/meta.ts` + `useMeta` + `Landing.tsx`; capability `client-landing`.
- **`two-step-login`**: `LoginForm` email-primeiro always-advance + `LoginModal` (Base-UI Dialog) na landing + `/login` two-step; dummy Argon2 no `login()` fecha oráculo de timing; `register` 409 documentado como tradeoff; ADR 0009; capability `two-step-login`.
- **`lgpd-leak-audit`**: `docs/PRIVACY.md` (+pt-BR: inventário, base legal, retenção, direitos→endpoints, cookies, suboperadores, `PRIVACY_CONTACT`) + seção anti-enumeração em `SECURITY.md` (+pt-BR); `test_leak_audit.py` (varredura de segredos em audit/outbox pós fluxos sensíveis + `caplog` do log-sender); skills Vercel pinadas (`063bee9`) em Instaladas; LGPD registrada sem skill existente.
- **`make-dev-loop`**: `make dev` (stack backend via compose + Vite em foreground, guards e hint de CORS) + `make dev-down`; capability `dev-loop`.
- **`release-guard`**: `release-check.yml` reprova PR com mudança de comportamento sem entrada `[Unreleased]` (docs-only passa); `--if-needed` mantém merges silenciosos sem tag; ADR 0012.
- **`make-env-check`**: `make env-check` reporta drift do `.env` vs `.env.example` (chaves + formas, nunca valores; exit 0/1/2) e roda dentro do `setup`; chaves `ARGON2_*` documentadas no exemplo.
- **`client-reformulation` (6 PRs com CI verde)**: PR1 fundação (`docs/DESIGN.md` adotado, trio `ui-designer`/`frontend-implementer`/`design-auditor`, Playwright axe+snapshot + job `web` no CI); PR2 tokens (`@theme` ⇐ DESIGN.md §4, system fonts); PR3 catálogo `/references` com `motion` pinado; PR4 base + RHF/Zod; PR5 páginas sem clichês; PR6 auditoria total (2 violações AA reais corrigidas) + baselines linux via workflow dedicado. Capabilities `design-system-link`, `browser-e2e` (+ `client-landing`, `two-step-login`).
- **`docs-release-audit`**: sync de status/contagens (138 backend + 71 vitest + 10 Playwright, 36 specs, Fases 0–11), `make dev` no README, Fase 11 no ROADMAP. `CHANGELOG.md` mantido na raiz por decisão (convenção + `release_notes.py` + `release.yml`).

## [v0.1.2] — 2026-09-16

- **`client-design-unification`**: shell admin (sidebar drawer<md/rail md–xl/full+cookie, topbar, rotas aninhadas), `lib/icons.tsx` regra de ouro (lucide+react-icons+SVGs), primitivos `dialog`/`toggle-group`/`floating-input`/`circular-progress`, portes `theme-toggle`/`ErrorOne`/`file-uploader`/`credit-usage-card`/`run-action-button`/`gooey-menu`, tipografia Inter/JetBrains Mono, `KpiGrid`/`PageHeader` actions/`EmptyState`; change em `client/openspec/changes/design-unification/`, debate em `docs/review-design.md`.

<!-- copy/paste template (delete this comment when adding an entry):
- **`scope`**: what changed + affected spec/endpoint.
  Behavior PRs must add one entry here; docs-only PRs pass without it.
-->

## [v0.2.0] — 2026-09-16

- **`auto-release-bump-infer`**: `auto_release.py --bump auto` (default) infere semver do título (`feat`→minor, `fix`-class→patch, `BREAKING CHANGE`/`!`→major); explícito sempre vence; change em `openspec/changes/auto-release-bump-infer/`.

## [v0.3.0] — 2026-09-16

- **`animate-ui-adoption`**: reconcile dos 10 primitivos com os motion patterns upstream (`TabsPanels`+`AutoHeight`, scales, springs, variantes), `AvatarGroup` + `FileTree` novos, rota `/admin/gallery` (staff-only), ledger em `docs/review-design.md` §11; change em `client/openspec/changes/animate-ui-adoption/`.

## [v0.3.1] — 2026-09-17

- **`sidebar-demo`**: sidebar rica (org switcher dropdown, subgroups colapsáveis, orgs recentes + `...`, user dropdown, breadcrumb por rota), primitivos `dropdown-menu`/`breadcrumb`/`separator`/`collapsible` + `AvatarImage`; S8–S11: grupo Projects tenant-scoped (count, mini-avatares, actions menu, rail abre menu), Organizations com subpastas, página Settings (placeholder), página `/projects/new`, labels DEMO; change em `client/openspec/changes/sidebar-demo/`.
- **`e2e-isolated-db`**: `make e2e-full` (postgres/redis/API/preview dedicados em portas `E2E_*`, teardown no fim) — e2e não escreve mais no banco dev; `web-e2e` documentado como legado.
- **`root-bootstrap-tests`**: cobertura do bootstrap one-shot (5 unit sem DB + 4 integração: sucesso com audit `root.bootstrap`, recusas).
- **env**: `FRONTEND_URL` obrigatório (fail-fast em todo boot; CI recebe via `env:`), `env-check` em tabela com segredos mascarados e defaults do código, `auto_release` tolera `APP_VERSION` ausente no example.

## [Unreleased]

