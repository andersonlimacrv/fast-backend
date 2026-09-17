# ARCHITECTURE — fast-backend

> 🇬🇧 English | [Português (BR)](ARCHITECTURE.pt-BR.md)
>
> Derived from the code (not invented): verify against `uv run lint-imports` and the `app/` tree.

## Module map

```text
interfaces  (FastAPI: errors, health)        ← HTTP composition, maps errors→status
    ↓
modules     (domain, vertical slices)
├── identity        User/Credential, AuthenticationService, CurrentPrincipal
├── organization    Organization/Membership, owner|admin|member roles
├── tenancy         CurrentTenant, TenantScopedRepository, SuperuserContext, require_role
├── entitlements    grants + require_entitlement (light core, no billing)
├── projects        example tenant-scoped resource (pattern showcase)
├── audit           append-only trail (leaf)
├── billing_stripe  webhook → grants (leaf, BILLING_ENABLED flag)
└── admin           staff/root control plane (leaf, ADMIN_ENABLED flag, ADR 0005)
     ↓
core        (contracts and primitives: errors, settings, security port, contracts/)
     ↓
infrastructure (adapters: auth, db, email, storage, jobs, observability, payments, security)
```

## DAG (13 `import-linter` contracts, all KEPT)

`identity → organization → tenancy → entitlements`; leaves (`projects`, `audit`, `billing_stripe`) consume core with no return. Rule: never import another module's internals (`models|repository|service|dependencies|router|schemas`) — only `modules/<name>/public.py`, `core/contracts/`, or Taskiq events. Root `app/main.py` (composition root) is exempt and wires everything.

## Authenticated request flow

```text
Bearer JWT → CurrentPrincipal (signature, iss/aud/exp/type, tokens_valid_after, active?)
  → CurrentTenant (active_org_id × Postgres membership)
  → require_role / require_entitlement (if the route demands)
  → service (domain, never HTTPException) → interfaces translate error→status
```

Refresh: `SELECT FOR UPDATE` → mark `used_at` → mint successor → `replaced_by`; reuse revokes the whole family (commit before raise). Stripe webhook: HMAC → outbox `stripe:{id}` → apply → complete.

## Decision index (ADRs)

- `0001-remove-crudauth` — own auth (Argon2id, JWT + opaque refresh).
- `0002-tenancy-model` — `single|row`, no RLS in v1.
- `0003-module-tiers` — `CORE_MODULES` + optional leaves.
- `0004-app-dir` — flat `app/` package, imports `from app.*`.
- `0005-root-admin` — one-shot root via CLI + `BOOTSTRAP_KEY`, `is_staff`, leaf `admin/`.
- `0006-password-recovery` — opaque single-use token, boundary event, admin force-reset.
- `0007-social-contract` — contract + table only, flag off, OAuth deferred.
- `0008-public-release-meta` — public `GET /meta` allowlist + `APP_VERSION`.
- `0009-login-enumeration` — always-advance login + dummy Argon2, 409 tradeoff.
- `0010-references-makefile-removal` — `references/Makefile` removed with override.
- `0011-auto-release` — release on every merged PR.
- `0012-release-guard` — PR-time check + post-merge silence.
- `0013-client-routing-structure` — folders mirror `ROUTES` (see client section).

## Client (`client/`, canonical: `docs/CLIENT-STRUCTURE.md`)

Folders mirror `ROUTES` (`:param` → `[param]`, no `index.tsx`, file keeps its name); `App.tsx` only routes, group gates in `layouts/` (`protected-layout.tsx`); new route = folder + `ROUTES` line + `App` entry + breadcrumb + layout group. Dynamic segments are never authority — pages derive context from `AuthContext` and `RequireStaff`/membership. Components: shadcn defaults in `components/ui`, everything custom in `components/custom-ui/` (one entry per component, `effects/` for shared effects); icons only via `lib/icons.tsx`; theme/motion tokens per `docs/DESIGN.md`.
