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
- Módulos opcionais via flags por módulo (ex.: `BILLING_ENABLED`); `ENABLED_MODULES` genérico não tem runtime no v1.

```python
CORE_MODULES = ["identity", "organization", "tenancy", "entitlements"]  # sempre ligados (+ projects como exemplo)
# Folhas opcionais: audit, billing_stripe (flag BILLING_ENABLED), notifications_email/storage_s3/ai (futuros)
```

`entitlements` é **core leve**: tabela + dependency, sem billing obrigatório.

- Dir da aplicação: `app/` flat como pacote (`app/core/`, `app/infrastructure/`, `app/modules/`, `app/tests/`, `app/migrations/`); projeto Python na raiz (`pyproject.toml`, `alembic.ini`, `.env.example`). Imports sempre `from app.*`; `ruff known-first-party=["app"]`. Mapa v2→nosso: `backend/src/X` (v2) ≡ `app/X`. Detalhe em ADR 0004.

## 3. Decisões arquiteturais congeladas (v2 §23)

| Decisão | Escolha | Onde |
|---|---|---|
| Password hashing | Argon2id via `pwdlib` (custo por settings); bcrypt só migração | `app/infrastructure/auth/hashing.py` |
| Access token | JWT 10–15min, HS256, claims `sub/type/iat/exp/iss/aud/jti/active_org_id` | `app/infrastructure/auth/jwt.py` |
| Refresh | Opaco aleatório, só hash em Postgres, rotation obrigatória, reuse revoga family | `refresh_tokens{id,user_id,token_hash,family_id,created_at,expires_at,used_at,revoked_at,replaced_by,ip,user_agent}` |
| Refresh concorrência | Atomicamente consumível (`SELECT FOR UPDATE`, tudo na mesma transação; sem `raise` antes do commit) | `app/infrastructure/auth/refresh_tokens.py` |
| Revogação global | `users.tokens_valid_after`; válido exige `iat > trunc(valid_after)` (iat tem precisão de segundo) **só** em `CurrentPrincipal` | `app/modules/identity/dependencies.py` |
| Tenancy | `TENANCY_MODE=single\|row`; sem `schema`/`database` no env v1 | `app/modules/tenancy/` |
| Org context | `active_org_id` no JWT é **contexto, nunca autoridade**; autoridade = membership Postgres; troca via `POST /auth/switch-organization` emitindo novo access | `CurrentPrincipal → Membership → CurrentTenant` |
| RLS | Fora do v1; hardening futuro (revisar pooling antes) | ADR 0002 |
| Idempotência | Operação lógica única no backend (`outbox_messages` + `provider_event_id`/`stripe:{id}` unique); **sem prometer exactly-once externo** | `app/core/contracts`, Taskiq |
| Segurança | boundaries `auth ≠ authz ≠ tenancy ≠ entitlement ≠ audit`; service nunca levanta `HTTPException` | `app/core/errors.py`, `interfaces/` |
| Billing | Opcional por flag (`BILLING_ENABLED`); webhook → outbox → grants; preço via `STRIPE_PRICE_MAP` | `app/modules/billing_stripe/` |
| Storage/Email | Contratos em `core/contracts`; adapters em `infrastructure`; módulos nunca importam providers | `app/infrastructure/{email,storage}/` |

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

Opcionais são folhas (`billing_stripe`, `audit`, `notifications_email`, `storage_s3`, `ai`): consomem core, nenhum core depende deles. CI enforça com `import-linter`: contrato `layers`, `core-independence`, `infrastructure-no-upward-imports`, um `<mod>-internals-private` por módulo (explícito — wildcard com source pai é vácuo no import-linter), `no-internals-from-outside` e `no-provider-imports-in-modules`. **Ao criar um módulo**: adicionar seu contrato e listá-lo nas sources dos demais.

Módulo nunca depende direto de: Stripe, Redis, SMTP, S3, `FastAPI.Request`, infra de outro módulo. Tudo atravessa fronteira explícita.

## 5. TDD obrigatório

- Pirâmide ~70% unit / 25% integration / 5% e2e (orientação, risco manda).
- `app/tests/{unit,integration,e2e,fixtures}` + `conftest.py`; markers `unit,integration,e2e,slow,security`.
- Testcontainers Postgres+Redis sempre que o comportamento depender deles (`FB_TEST_NETWORK=host` onde bridge é bloqueada).
- Cobertura ≥80%, com rigor total em auth, tenancy, RBAC, billing, webhooks, idempotency, security.
- Suite v1.0.0: 95 testes (unit sem serviços + integração com Postgres/Redis reais).
- Mock de repository **não prova** isolamento de tenant.

## 6. Segurança

- Nunca logar: passwords, refresh/access tokens, API secrets, Stripe secrets.
- Checklist VPS: HTTPS, cookies `HttpOnly/SameSite/secure` quando houver, CSRF p/ cookie-auth, CORS explícito, trusted hosts/proxy, rate-limit + brute-force protection, headers, secrets fora do Git, containers non-root, Postgres/Redis não expostos.
- `CurrentPrincipal` valida signature + `iss/aud/exp/type` + `tokens_valid_after` + membership.
- Gate bandit: 0 Medium+ (`-ll`; Low como asserts em testes é aceito e documentado).

## 7. OpenSpec + skills

- Sem `app/` sem OpenSpec change (`proposal.md/tasks.md/design.md`) aprovada.
- Fluxo: `planner` escreve change → `tester` deriva testes → `backend-implementer` executa → `code-reviewer` + `security-auditor` conferem.
- Nenhuma skill instala sem entrada em `docs/SKILLS-REGISTRY.md` (nome, origem URL+SHA, escopo, motivo, status, risco, dono), pin por SHA/tag.

## 8. Não-fazer no v1

Kubernetes, microservices, Kafka, event sourcing, CQRS completo, schema/database-per-tenant, custom event bus, feature-flag platform, service mesh, multi-cloud, AI obrigatório, Stripe obrigatório, frontend obrigatório, RLS obrigatório, OTel obrigatório, repository-abstraction-para-tudo, DDD formal excessivo.
