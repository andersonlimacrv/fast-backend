## Context

Pós-Fase 2: `identity` completo (User/Credential/`CurrentPrincipal`), `active_org_id` como contexto sem autoridade. Faltam as tabelas e o enforcement que dão significado ao claim (ADR 0002, v2 §4).

## Goals / Non-Goals

**Goals:**
- Vínculo usuário↔org com papéis fixos e API pública mínima.
- Isolamento row-level impossível de esquecer (repositório exige tenant).

**Non-Goals:**
- Autorização por recurso/entitlement (Fase 4), invites por email, RLS.

## Decisions

1. **Papéis fixos `owner|admin|member` como `str` + check Python** (não enum PG) — migrar p/ enum nativo só se um cliente exigir; string evita lock de DDL.
2. **`slug` único legível** (`name` normalizado + sufixo curto em colisão) — URLs amigáveis sem expor UUID.
3. **Owner não pode ser removido/rebaixado se for o último owner** — invariante no service (nunca no router).
4. **`CurrentTenant` retorna 404 (não 403) para org inexistente ou sem membership?** — 403 com detalhe genérico "access denied" nos dois casos: não vazar existência de org (decisão anti-enumeração; IDOR test aceita 403/404).
5. **`TenantScopedRepository` genérico sobre `tenant_id`** — base com `tenant_id` obrigatório no `__init__`; recursos concretos herdam; ` SuperuserContext` é objeto explícito passado no construtor alternativo (`scoped_for_superuser()`), nunca flag booleana silenciosa.
6. **Switch valida via `organization.public.assert_membership`** — primeiro consumo real de `public.py` entre módulos (prova do DAG).
7. **Migration 0002 aditiva** — `organizations`, `memberships` (unique `user_id,org_id`), sem alterar tabelas da Fase 1.

## Risks / Trade-offs

- [`owner` único vira lock-out se o dono perde acesso] → mitigação Fase 4+: superuser operacional via `SuperuserContext`; documentado.
- [Slug race em criação concorrente] → unique constraint + retry com sufixo (2 tentativas, depois 409).
- [Alternativa rejeitada: membership no JWT como autoridade] → JWT velho autorizaria após remoção; v2 §4.2 exige revalidação no banco.
