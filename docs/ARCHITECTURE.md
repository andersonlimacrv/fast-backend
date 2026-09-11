# ARCHITECTURE — fast-backend

> Derivado do código (não inventado): confira contra `uv run lint-imports` e a árvore `app/`.

## Mapa de módulos

```text
interfaces  (FastAPI: errors, health)        ← composição HTTP, traduz erros→status
    ↓
modules     (domínio por slice vertical)
├── identity        User/Credential, AuthenticationService, CurrentPrincipal
├── organization    Organization/Membership, roles owner|admin|member
├── tenancy         CurrentTenant, TenantScopedRepository, SuperuserContext, require_role
├── entitlements    grants + require_entitlement (core leve, sem billing)
├── projects        recurso tenant-scoped de exemplo (vitrine do padrão)
├── audit           trilha append-only (folha)
└── billing_stripe  webhook → grants (folha, flag BILLING_ENABLED)
    ↓
core        (contratos e primitivas: errors, settings, security port, contracts/)
    ↓
infrastructure (adapters: auth, db, email, storage, jobs, observability, payments, security)
```

## DAG (12 contratos `import-linter`, todos KEPT)

`identity → organization → tenancy → entitlements`; folhas (`projects`, `audit`, `billing_stripe`) consomem core sem retorno. Regra: nunca importar internals (`models|repository|service|dependencies|router|schemas`) de outro módulo — só `modules/<nome>/public.py`, `core/contracts/` ou eventos Taskiq. Raiz `app/main.py` (composition root) é isenta e monta tudo.

## Fluxo de um request autenticado

```text
Bearer JWT → CurrentPrincipal (signature, iss/aud/exp/type, tokens_valid_after, ativo?)
  → CurrentTenant (active_org_id × membership Postgres)
  → require_role / require_entitlement (se a rota exigir)
  → service (domínio, nunca HTTPException) → interfaces traduz erro→status
```

Refresh: `SELECT FOR UPDATE` → marca `used_at` → emite sucessor → `replaced_by`; reuse revoga a family inteira (commit antes do raise). Webhook Stripe: HMAC → outbox `stripe:{id}` → aplica → complete.

## Índice de decisões (ADRs)

- `0001-remove-crudauth` — auth própria (Argon2id, JWT+refresh opaco).
- `0002-tenancy-model` — `single|row`, sem RLS no v1.
- `0003-module-tiers` — `CORE_MODULES` + folhas opcionais.
- `0004-app-dir` — pacote flat `app/`, imports `from app.*`.
