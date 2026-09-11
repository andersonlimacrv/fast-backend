# RULES — fast-backend (regras de implementação)

> Fonte normativa após `AGENTS.md`. `references/` nunca é norma.

## 1. Hierarquia de decisão

Conflito resolve sempre nesta ordem (topo vence):

```text
AGENTS.md > docs/RULES.md (este arquivo) > docs/ROADMAP.md > docs/adr/* > references/* > copy/*
```

- `references/implementation_v2.md` é a **única referência congelada**. Serve para entender "como/porquê pensar", nunca "o que fazer".
- `copy/` (`benavlabs_crudauth`, `benavlabs_FastAPI-boilerplate`) é evidência do que o upstream faz, não obrigação.
- **Nunca editar `references/`.** Se a v2 estiver errada, registrar ADR novo, não reescrever a referência.

## 2. Nomenclatura congelada (decisão do usuário)

- Usar `CORE_MODULES` (não `PLATFORM_MODULES`).
- Usar `OPTIONAL_MODULES` + `ENABLED_MODULES` para plugáveis reais.

```python
CORE_MODULES = ["identity", "organization", "tenancy", "entitlements", "health"]
# plugáveis reais, controlados por env:
# ENABLED_MODULES=billing_stripe,audit,notifications_email,storage_s3,ai
OPTIONAL_MODULES = ["billing_stripe", "audit", "notifications_email", "storage_s3", "ai"]
```

`entitlements` é **core leve**: tabela + dependency, sem billing obrigatório.

## 3. Decisões arquiteturais congeladas (v2 §23)

| Decisão | Escolha | Onde |
|---|---|---|
| Password hashing | Argon2id via `pwdlib`; bcrypt só migração | `infrastructure/auth/hashing.py` |
| Access token | JWT 10–15min, HS256, claims `sub/type/iat/exp/iss/aud/jti/active_org_id` | `infrastructure/auth/jwt.py` |
| Refresh | Opaco aleatório, só hash em Postgres, rotation obrigatória, reuse revoga family | `refresh_tokens{id,user_id,token_hash,family_id,created_at,expires_at,used_at,revoked_at,replaced_by,ip,user_agent}` |
| Refresh concorrência | Atomicamente consumível (`SELECT FOR UPDATE` ou `UPDATE ... WHERE used_at IS NULL`, tudo na mesma transação) | `infrastructure/auth/refresh_tokens.py` |
| Revogação global | `users.tokens_valid_after`; regra `token.iat >= user.tokens_valid_after` **só** em `CurrentPrincipal` | `modules/identity/dependencies.py` |
| Tenancy | `TENANCY_MODE=single\|row`; sem `schema`/`database` no env v1 | `modules/tenancy/` |
| Org context | `active_org_id` no JWT é **contexto, nunca autoridade**; autoridade = membership Postgres; troca via `POST /auth/switch-organization` emitindo novo access | `CurrentPrincipal → Membership → CurrentTenant` |
| RLS | Fora do v1; hardening futuro (revisar pooling antes) | ADR 0002 |
| Idempotência | Operação lógica única no backend (`outbox_messages` + `provider_event_id` unique); **sem prometer exactly-once externo** | `core/contracts`, Taskiq |
| Segurança | boundaries `auth ≠ authz ≠ tenancy ≠ entitlement ≠ audit`; service nunca levanta `HTTPException` | `core/errors.py`, `interfaces/` |

## 4. Regra de acoplamento + DAG

```text
interfaces → modules/application → core contracts → infrastructure adapters
```

- Módulo nunca importa internals de outro (`models.py`, `repository.py`, `service.py`, `dependencies.py`).
- Dependência só por: (1) `modules/<nome>/public.py`, (2) `core/contracts/`, (3) eventos Taskiq.
- DAG permitido (seta = importação permitida):

```text
identity → organization → tenancy → entitlements
```

Opcionais são folhas (`billing_stripe`, `audit`, `notifications_email`, `storage_s3`, `ai`): consomem core, nenhum core depende deles. CI enforça com `import-linter`.

Módulo nunca depende direto de: Stripe, Redis, SMTP, S3, `FastAPI.Request`, infra de outro módulo. Tudo atravessa fronteira explícita.

## 5. TDD obrigatório

- Pirâmide ~70% unit / 25% integration / 5% e2e (orientação, risco manda).
- `backend/tests/{unit,integration,e2e,fixtures}` + `conftest.py`; markers `unit,integration,e2e,slow,security`.
- Testcontainers Postgres+Redis sempre que o comportamento depender deles.
- Cobertura ≥80%, com rigor total em auth, tenancy, RBAC, billing, webhooks, idempotency, security.
- 3 testes-guia bloqueantes: reuse-family + concorrência A/B (só 1 rotação vence) + tenant isolation IDOR (list/get/update/delete) + webhook `provider_event_id` unique.
- Mock de repository **não prova** isolamento de tenant.

## 6. Segurança

- Nunca logar: passwords, refresh/access tokens, API secrets, Stripe secrets.
- Checklist VPS: HTTPS, cookies `HttpOnly/SameSite/secure` quando houver, CSRF p/ cookie-auth, CORS explícito, trusted hosts/proxy, rate-limit + brute-force protection, headers, secrets fora do Git, containers non-root, Postgres/Redis não expostos.
- `CurrentPrincipal` valida signature + `iss/aud/exp/type` + `tokens_valid_after` + membership.

## 7. OpenSpec + skills

- Sem `backend/` sem OpenSpec change (`proposal.md/tasks.md/design.md`) aprovada.
- Fluxo: `planner` escreve change → `tester` deriva testes → `backend-implementer` executa → `code-reviewer` + `security-auditor` conferem.
- Nenhuma skill instala sem entrada em `docs/SKILLS-REGISTRY.md` (nome, origem URL+SHA, escopo, motivo, status, risco, dono), pin por SHA/tag.

## 8. Não-fazer no v1

Kubernetes, microservices, Kafka, event sourcing, CQRS completo, schema/database-per-tenant, custom event bus, feature-flag platform, service mesh, multi-cloud, AI obrigatório, Stripe obrigatório, frontend obrigatório, RLS obrigatório, OTel obrigatório, repository-abstraction-para-tudo, DDD formal excessivo.
