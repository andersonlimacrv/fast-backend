# ADR 0002 — Modelo de tenancy (`single|row`, sem RLS no v1)

- Status: aceito
- Data: 2026-09-11
- Referência congelada: `references/implementation_v2.md` §4

## Decisão

- `TENANCY_MODE=single|row`. Sem `schema`/`database-per-tenant` no env do v1 (documentar como futuro, não implementar).
- `single`: um tenant lógico; infra continua compatível, contexto resolvido automaticamente.
- `row`: toda entidade tenant-scoped tem `tenant_id`; banco compartilhado.
- `active_org_id` no JWT é **contexto, nunca autoridade**. Autoridade = membership Postgres: `JWT(user_id+active_org_id) → CurrentPrincipal → Membership → CurrentTenant`.
- Troca de org: `POST /auth/switch-organization` valida membership e emite **novo access token** com `active_org_id` novo. JWT velho não autoriza após perda de membership.
- Enforcement: `TenantScopedRepository(tenant_id)` — construtor exige tenant, nenhum método padrão lê sem filtro `WHERE tenant_id = :id`. Bypass cross-tenant (suporte/admin) só via `SuperuserContext` explícito e visível.
- RLS fora do v1. Se adotado no futuro, revisar pooling (PgBouncer `SET LOCAL` + transaction pooling) **antes** de ativar.

## Teste de aceite

Integração com Postgres real (Testcontainers), cobrindo list/get/update/delete + ataque IDOR direto por ID (`403/404`, nunca vazar). Mock de repository não vale.
