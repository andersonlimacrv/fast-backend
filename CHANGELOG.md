# CHANGELOG — fast-backend

Format: delivered phases (Conventional Commits in git tell the fine-grained story).
Releases are automatic: every PR merged to `main` finalizes `[Unreleased]` into a version (see ADR 0011); never leave entries parked here.
An empty `[Unreleased]` below is the normal idle state — the bot (`auto_release.py --if-needed`) only cuts a release when a behavior change adds an entry; docs-only PRs pass the gate without one (see `release-check.yml`).
Order: newest first — `[Unreleased]` on top, then versions descending (Keep a Changelog); exactly one `[Unreleased]` section (the release bot refuses to guess).
Language: entries are written in **English** (see `docs/RULES.md` §9).

> Version convention: tags and sections use the `v` prefix from here on (`v1.1.0`, …).
> The `0.1.0` section below is historical (tag `0.1.0` without prefix) and stays as is.

## [Unreleased]

- **`custom-ui-circular-progress`**: the item 04 proof is no longer static — `CircularProgressDemo` with `−10`/`+10`/`Random` moving the same `value` across three variants (`size` 120 with the value, 120 `showValue={false}`, 96 `strokeWidth={6}`) so the ring transition (`stroke-dashoffset`, 200ms) is actually visible; component untouched (it already lives in `custom-ui`).
- **`custom-ui-alert-dialog`**: item 03 converged into `custom-ui/components/alert-dialog.tsx` (debt §14 −1) with the upstream choreography: portal gated by `AnimatePresence` + `keepMounted`, backdrop fading and popup entering with a 3D flip (`perspective` + `rotateX|rotateY` via the `from` prop, `scale 0.8→1`) — **both directions animate** (previously only the entrance); spring **500/32** (~0.25s, faster than the upstream default 150/25 — owner request), reduced-motion collapses everything; **backdrop uses `backdrop-blur-sm`** (the upstream `filter: blur()` is invisible over a flat layer — the real frost comes from `backdrop-filter`, applied statically while the overlay only fades) plus animated blur on the popup; centering through `AlertDialog.Viewport`; proof with two triggers (`bottom` default and `from="top"` for comparison). **`from="bottom"` is now the app-wide overlay default** — documented in `DESIGN.md` §7 (guideline 6) so future dialogs/popups follow it. Validated by the owner on 2026-09-19.
- **`custom-ui-accordion`**: layer rule settled — `/ui` is the **untouched** shadcn base and page-facing visual components live in `/custom-ui` (they may compose the base underneath); new `custom-ui/components/accordion.tsx` built on the vendored `Collapsible` (radix + `AnimatePresence`), so it opens **and closes** animated (`multiple`, `keepRendered`, chevron via `data-state`); default reveal is **`mask`**, faithful to the upstream `primitives-base-accordion` (animated CSS mask `--mask-stop` 0%→100% plus `y: 20` — content is unveiled by a curtain instead of drawing translucent text over the separator), with `reveal="depth"` (3D) as an alternative and `slide` kept in the `Collapsible`/sidebar; spring `150/22` as the panel default (same as the site's component); **`onHover`** (default `false`) on both `Collapsible` and `Accordion` — the item opens on `mouseenter` and closes on `mouseleave` through the same path as a click (same animation), with click/keyboard/touch preserved (hover is an extra trigger, never the only one); the catalog now points `02 Accordion` at the own port and gains **`24 Collapsible`** (in production in the sidebar, previously missing from the catalog); the 02 proof has 5 columns; declared debt for the 9 `/ui` files still carrying `animate-ui-adoption` customization (`review-design` §14, converging 1-by-1 during validation).
- **`lab-harness`** (with `lab-components`): single catalog in `client/src/lib/catalog/` (23 entries — one per `references/components_to_use/` doc — with stable `n`, `class` component|block, `kind`, `status` pending|validated|dropped, `ref`, `source`, `usedIn`); `/admin/lab` lists adoption (Components/Blocks), `/admin/lab/trials` proves the `pending` ones (shared registry `components/catalog-demos.tsx`) and `/admin/gallery` shows only the `validated` ones with their proof plus where they are really used (quick link when a route exists); validating = flipping `status` in the catalog (the proof migrates by itself); the `playground*`/`admin/components` routes no longer exist; only validated item so far: `404PageNotFound` (`ErrorOne` on the `*` route).
- **`changelog-history-recovery`**: restored versions `0.1.0`–`v0.3.1` (the `auto_release` bot dropped those sections when consolidating a file that carried two `[Unreleased]` sections — fallout from commit `bf80c8d`); the file now follows Keep a Changelog ordering (newest first) and was **fully translated to English** per `docs/RULES.md` §9; the bot gate itself will be fixed in a dedicated change.

<!-- copy/paste template (delete this comment when adding an entry):
- **`scope`**: what changed + affected spec/endpoint.
  Behavior PRs must add one entry here; docs-only PRs pass without it.
-->

## [v0.3.2] — 2026-09-19

- **`ci-cookie-sessions`**: `cookie-auth.spec.ts` skips when the API does not emit cookies (`describeWithCookies`, same pattern as `describeWithApi`); the CI `web` job enables `AUTH_COOKIE_ENABLED=true` + `SECURE=false` (plain http) so the 4 tests run there; `.env.example` no longer trips the gitleaks `generic-api-key` false positive (reworded `AUTH_COOKIE_DOMAIN` comment, 0 findings on tracked files).
- **`bootstrap-email-validation`**: `scripts/bootstrap_root.py` rejects e-mails without a valid format before any DB I/O (syntax via `email-validator`, no DNS; generic failure preserved) — a typo in the one-shot bootstrap no longer becomes a permanent root; unit tests without DB + integration (0 users).
- **`bootstrap-ux-fixes`**: `amain` asks for the password twice (mismatch → generic failure, exit 1, 0 rows); `make admin-bootstrap` reads `BOOTSTRAP_KEY` from `.env` on its own (it previously required a manual export and failed closed) and requires an e-mail (`ROOT_EMAIL=` or `email=`) with a usage message; first-run runbook in `DEPLOYMENT.md` (+pt-BR) + README pointer (EN+PT).
- **`proxy-hops-trusted`**: `TRUSTED_PROXY_HOPS=0` fail-closed (never honors `X-Forwarded-For` by default); single real-IP helper (throttle + `audit.ip` spoof-proof); spoof test with real Postgres/Redis; Caddy/`ProxyHeadersMiddleware` runbook in `DEPLOYMENT.md`.
- **`rate-limit-global`**: `POST /auth/register` throttled per IP before Argon2 (only 409 consumes; 201 never) with an identical generic 429 for new and existing e-mails; global per-IP anti-abuse ceiling on `/auth/*` + `/admin/*` (`RATE_LIMIT_GLOBAL_*`, `REGISTER_*` in settings + `.env.example` + `env-check`); 429 with `Retry-After` (key TTL) and a generic body; keys derived from the real IP of `proxy-hops-trusted` (`TRUSTED_PROXY_HOPS`); real Redis in the tests.
- **`auth-cookies-http-only`** (backend; dual transition, flag off by default): `AUTH_COOKIE_ENABLED=true` emits the session as `HttpOnly`/`SameSite=Lax` cookies (`access_token` `Path=/`, `refresh_token` `Path=/auth`, `Max-Age`=TTLs) on login/refresh/switch and expires them on logout; dual header-OR-cookie reading in `CurrentPrincipal`; cookie-authenticated mutations require the JS-readable `csrf_token` synchronizer echoed in `X-CSRF-Token` (403 without it; `CSRF_ENABLED` kill-switch); `AUTH_COOKIE_SECURE` tied to HTTPS (dev-http uses `false`; production fails without `Secure`/CSRF); `AUTH_COOKIE_SAMESITE=lax|strict`, optional `AUTH_COOKIE_DOMAIN`; response bodies still carry the tokens (header-only removal is a follow-up change; rollback = flag off); `active_org_id` stays non-secret; runbook in `DEPLOYMENT.md` (+pt-BR), inventory in `PRIVACY.md` (+pt-BR); tests with real Postgres/Redis.
- **`superuser-coverage`** (test-only, no runtime): RBAC matrix pinned across the 14 `/admin/*` routes, grant/revoke lifecycle + `admin.staff_revoked` audit, explicit `SuperuserContext` vs a common tenant (real Postgres; `reason` keeps its default — Option B), bootstrap with generic stdout, strict 409 (`LastRootProtectedError`); changes in `openspec/changes/superuser-coverage/`.
- **`suite-hermetica`** (test-only, no runtime): session-autouse fixture isolates the developer `.env` (allowlist + `env_file=None`, teardown restores it); `base_settings` passes an explicit `frontend_url`; the suite is green with and without a customized `.env`; change in `openspec/changes/suite-hermetica/`.

## [v0.3.1] — 2026-09-17

- **`sidebar-demo`**: rich sidebar (org switcher dropdown, collapsible subgroups, recent orgs + `...`, user dropdown, per-route breadcrumb), `dropdown-menu`/`breadcrumb`/`separator`/`collapsible` primitives + `AvatarImage`; S8–S11: tenant-scoped Projects group (count, mini avatars, actions menu, rail opens the menu), Organizations with subfolders, Settings page (placeholder), `/projects/new` page, DEMO labels; change in `client/openspec/changes/sidebar-demo/`.
- **`e2e-isolated-db`**: `make e2e-full` (dedicated postgres/redis/API/preview on `E2E_*` ports, teardown at the end) — e2e no longer writes to the dev database; `web-e2e` documented as legacy.
- **`root-bootstrap-tests`**: coverage for the one-shot bootstrap (5 unit tests without DB + 4 integration: success with the `root.bootstrap` audit, refusals).
- **env**: `FRONTEND_URL` required (fail-fast on every boot; CI receives it via `env:`), `env-check` as a table with masked secrets and code defaults, `auto_release` tolerates a missing `APP_VERSION` in the example.

## [v0.3.0] — 2026-09-16

- **`animate-ui-adoption`**: reconciled the 10 primitives with the upstream motion patterns (`TabsPanels`+`AutoHeight`, scales, springs, variants), new `AvatarGroup` + `FileTree`, `/admin/gallery` route (staff-only), ledger in `docs/review-design.md` §11; change in `client/openspec/changes/animate-ui-adoption/`.

## [v0.2.0] — 2026-09-16

- **`auto-release-bump-infer`**: `auto_release.py --bump auto` (default) infers semver from the title (`feat`→minor, `fix`-class→patch, `BREAKING CHANGE`/`!`→major); an explicit bump always wins; change in `openspec/changes/auto-release-bump-infer/`.

## [v0.1.2] — 2026-09-16

- **`client-design-unification`**: admin shell (sidebar drawer<md/rail md–xl/full+cookie, topbar, nested routes), `lib/icons.tsx` golden rule (lucide+react-icons+SVGs), `dialog`/`toggle-group`/`floating-input`/`circular-progress` primitives, ports `theme-toggle`/`ErrorOne`/`file-uploader`/`credit-usage-card`/`run-action-button`/`gooey-menu`, Inter/JetBrains Mono typography, `KpiGrid`/`PageHeader` actions/`EmptyState`; change in `client/openspec/changes/design-unification/`, debate in `docs/review-design.md`.

## [v0.1.1] — 2026-09-16

- **A (`A-admin-control-plane`)**: `users.is_staff` + `CHECK (superuser ⇒ staff)` + partial index `uq_single_root`; CLI `scripts/bootstrap_root.py` (`make admin-bootstrap`, `BOOTSTRAP_KEY` constant-time, fail-closed, audited `root.bootstrap`); leaf module `app/modules/admin/` (policies pure, `AdminContext`, `require_staff/require_root`, action endpoints staff vs root, never `PATCH is_*`, `SuperuserContext(reason=...)` explicit); `reason+success` in `audit.metadata` (AdminAction via metadata, no new table); `LastRootProtectedError` → 409; `ADMIN_ENABLED` flag; 13th import-linter contract.
- **B (`B-password-recovery`)**: `password_resets{token_hash,expires_at,used_at}` hash-only, TTL 60min, `SELECT FOR UPDATE` single-use; `POST /auth/password/forgot` (always 202, throttled, no enumeration) → outbox `email.template` → worker renders/sends/redacts; `POST /auth/password/reset` boundary event (Argon2id + `tokens_valid_after` + refresh revoke + sibling invalidation); `POST /admin/users/{id}/force-password-reset` (`accepted`, no secret); `password_reset.*` templates (`StrictUndefined`); `LogEmailSender.send_template` never logs context; Taskiq `password.purge`; Mailpit dev via `make tools`.
- **C (`C-social-contract`)**: `core/contracts/social.py` Protocol + `linked_identities(provider,provider_sub)` unique, `SOCIAL_LOGIN_ENABLED=false`, no route (OAuth activation deferred with state+PKCE).

Docs: ADRs 0005–0007, `DEPLOYMENT` (+pt-BR) root/recovery runbook, `SKILLS-REGISTRY` triage (SQLAdmin/CRUDAdmin/email/OIDC as evaluated-only), `.env.example` vars without secrets.

- **`backend-release-meta`**: public `GET /meta` `{app, version, modules:[{key, enabled}]}` (allowlist, no secrets/hosts/PII) + `APP_VERSION` (default `"0.1.0"`, injected from the tag at release time); anti-leak test scanning the body; ADR 0008.
- **`client-landing-home`**: public landing `/` (live version/modules/flags from `/meta`, static offline fallback, zero third parties); logged-in home at `/~`; `Protected` without a session → `/`; `services/meta.ts` + `useMeta` + `Landing.tsx`; capability `client-landing`.
- **`two-step-login`**: `LoginForm` e-mail-first always-advance + `LoginModal` (Base-UI Dialog) on the landing page + two-step `/login`; dummy Argon2 in `login()` closes the timing oracle; `register` 409 documented as a tradeoff; ADR 0009; capability `two-step-login`.
- **`lgpd-leak-audit`**: `docs/PRIVACY.md` (+pt-BR: inventory, legal basis, retention, rights→endpoints, cookies, sub-processors, `PRIVACY_CONTACT`) + anti-enumeration section in `SECURITY.md` (+pt-BR); `test_leak_audit.py` (secret scan across audit/outbox after sensitive flows + `caplog` of the log sender); Vercel skills pinned (`063bee9`) under Installed; LGPD recorded with no existing skill.
- **`make-dev-loop`**: `make dev` (backend stack via compose + Vite in the foreground, guards and a CORS hint) + `make dev-down`; capability `dev-loop`.
- **`release-guard`**: `release-check.yml` fails a PR with a behavior change but no `[Unreleased]` entry (docs-only passes); `--if-needed` keeps silent merges tagless; ADR 0012.
- **`make-env-check`**: `make env-check` reports `.env` vs `.env.example` drift (keys + shapes, never values; exit 0/1/2) and runs inside `setup`; `ARGON2_*` keys documented in the example.
- **`client-reformulation` (6 PRs, green CI)**: PR1 foundation (`docs/DESIGN.md` adopted, `ui-designer`/`frontend-implementer`/`design-auditor` trio, Playwright axe+snapshot + `web` job in CI); PR2 tokens (`@theme` ⇐ DESIGN.md §4, system fonts); PR3 `/references` catalog with pinned `motion`; PR4 base + RHF/Zod; PR5 pages without clichés; PR6 full audit (2 real AA violations fixed) + linux baselines via a dedicated workflow. Capabilities `design-system-link`, `browser-e2e` (+ `client-landing`, `two-step-login`).
- **`docs-release-audit`**: status/count sync (138 backend + 71 vitest + 10 Playwright, 36 specs, Phases 0–11), `make dev` in the README, Phase 11 in the ROADMAP. `CHANGELOG.md` kept at the root by decision (convention + `release_notes.py` + `release.yml`).

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
