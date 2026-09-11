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
└── billing_stripe  webhook → grants (leaf, BILLING_ENABLED flag)
    ↓
core        (contracts and primitives: errors, settings, security port, contracts/)
    ↓
infrastructure (adapters: auth, db, email, storage, jobs, observability, payments, security)
```

## DAG (12 `import-linter` contracts, all KEPT)

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
