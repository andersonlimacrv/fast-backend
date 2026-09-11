# fast-backend — Plano de Arquitetura, Gaps e Roadmap (v2)

### Baseado em Fastro (benavlabs/FastAPI-boilerplate) v0.19.0 — **sem crudauth**

> v2 consolida a revisão estrutural da v1: auth própria (JWT + refresh opaco em Postgres, sem sessions no core), tenancy `single|row`, módulos em camadas (core vs opcional), acoplamento entre módulos via API pública/contracts/eventos com DAG explícito, storage local-first, roadmap reordenado (auth antes de billing), refresh token atomicamente consumível, `active_org_id` como contexto — não autoridade — e RLS fora do v1. Seções não alteradas nesta revisão (checklist VPS, plano de docs e lista de não-fazer) permanecem como na v1.

---

## Decisões arquiteturais congeladas

| Decisão                               | Escolha                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Password hashing**                  | **Argon2id** via `pwdlib`; bcrypt apenas para compatibilidade/migração de hashes existentes |
| **Access token**                      | JWT curto, inicialmente **10–15 min**                                                       |
| **Algoritmo JWT**                     | **HS256** no monólito inicial                                                               |
| **Refresh token**                     | Opaco, aleatório, armazenado somente como hash em PostgreSQL                                |
| **Refresh rotation**                  | Obrigatória                                                                                 |
| **Reuse detection**                   | Obrigatória; reuse de um token já consumido revoga toda a family                            |
| **Concorrência de refresh**           | Operação atomicamente protegida no PostgreSQL                                               |
| **Revogação global de access tokens** | `users.tokens_valid_after`                                                                  |
| **Tenant mode**                       | `TENANCY_MODE=single\|row`                                                                  |
| **Contexto de organização**           | `active_org_id` no JWT, mas nunca como autoridade isolada                                   |
| **Fonte de autoridade de membership** | PostgreSQL                                                                                  |
| **Tenant isolation**                  | `TenantScopedRepository` + testes de integração com PostgreSQL real                         |
| **PostgreSQL RLS**                    | Fora do v1; hardening futuro                                                                |
| **Billing**                           | Stripe como módulo opcional                                                                 |
| **Storage**                           | local → MinIO → S3-compatible                                                               |
| **Arquitetura**                       | Modular Monolith Async                                                                      |
| **Sessions**                          | Fora do core                                                                                |
| **OAuth/API keys/passkeys**           | Extensões futuras sobre `CurrentPrincipal`                                                  |

---

## Decisão registrada: abandono consciente do crudauth

O Fastro 0.19.0 migrou para `crudauth` (sessions + CSRF + OAuth + API keys) justamente para eliminar aproximadamente 6.000 linhas de auth própria que existiam no 0.18. Ao reintroduzir auth própria aqui, isso representa uma reversão parcial dessa decisão e precisa estar registrada como ADR, não como escolha implícita.

### `docs/adr/0001-remove-crudauth.md`

> **Contexto**: o Fastro 0.19 delega autenticação ao `crudauth` (sessions server-side como padrão, JWT bearer como capacidade opcional da lib). O `fast-backend` possui um objetivo diferente: JWT + refresh são o mecanismo principal de autenticação, sem sessions no core, com controle explícito sobre rotation, revogação, reuse detection e ciclo de vida das credenciais.
>
> **Decisão**: remover `crudauth` do dependency tree. Implementar autenticação própria: hashing de senha, JWT access token de vida curta, refresh token opaco com fonte de verdade em PostgreSQL, rotation, family/reuse detection, throttling de login e `CurrentPrincipal`.
>
> **Consequência**: estamos conscientemente recuperando ownership da camada de autenticação para adequá-la ao objetivo deste boilerplate. Para compensar o aumento da superfície de segurança, a implementação terá escopo menor que a auth histórica do Fastro, fronteiras explícitas (`infrastructure/auth/` para mecânica e `modules/identity/` para domínio), TDD desde o início e testes de integração reais com PostgreSQL via Testcontainers para rotation, concorrência, reuse e revogação.
>
> A operação de refresh deverá ser atomicamente consumível: validação, marcação de uso, criação do novo token e atualização da relação `replaced_by` pertencem à mesma transação. O objetivo é impedir que duas requisições concorrentes consumam o mesmo refresh token válido.
>
> Sessions/cookies, OAuth, API keys, magic link e passkeys **não são removidos como conceito**. Tornam-se extensões futuras opcionais sobre a mesma base de `CurrentPrincipal`, somente quando um projeto concreto precisar delas.

---

# Top 10 gaps críticos

| #  | Gap                                                     | Justificativa da ordem                                                                                                              |
| -- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1  | **Auth própria (JWT + refresh), substituindo crudauth** | Tudo depende disso. Sem um `CurrentPrincipal` confiável, o restante não possui identidade sobre a qual construir autorização.       |
| 2  | **Modelo de tenancy e enforcement**                     | O modelo influencia o schema de praticamente todas as entidades futuras; decidir tarde gera migrations e refatorações dolorosas.    |
| 3  | **Identity / Organization / Membership**                | RBAC e entitlements dependem do vínculo usuário ↔ organização.                                                                      |
| 4  | **Autorização (RBAC básico) + Entitlements**            | Features e planos precisam de uma camada de autorização independente de billing.                                                    |
| 5  | **Observabilidade básica + segurança**                  | Sem logs, health checks, headers, CORS e configuração segura, diagnosticar os itens anteriores em produção fica muito mais difícil. |
| 6  | **E-mail transacional**                                 | Reset de senha e convites de organização dependem dessa capacidade.                                                                 |
| 7  | **Storage**                                             | Necessário para uploads e arquivos, mas não bloqueia o núcleo SaaS.                                                                 |
| 8  | **Jobs + idempotência**                                 | Várias funcionalidades futuras reutilizarão o mesmo padrão assíncrono.                                                              |
| 9  | **Auditoria + observabilidade avançada + backup**       | Torna operações sensíveis rastreáveis e prepara o sistema para produção real.                                                       |
| 10 | **Billing (Stripe) como módulo opcional**               | É importante comercialmente, mas o backend deve funcionar corretamente sem billing.                                                 |

---

# 1. Gap Analysis

| Área                 | Decisão v2                                        | Detalhe                                                                                                               |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Auth**             | Core próprio, sem crudauth e sem sessions no core | JWT access + refresh opaco PostgreSQL + `CurrentPrincipal`.                                                           |
| **Password hashing** | Argon2id                                          | `pwdlib` como interface; bcrypt apenas para compatibilidade/migração. A OWASP recomenda Argon2id para novos sistemas. |
| **JWT**              | HS256                                             | Adequado ao monólito inicial; RS256 só se houver necessidade real de verificação externa.                             |
| **Refresh**          | PostgreSQL como fonte de verdade                  | Rotation, reuse detection, family revocation e operação atomicamente protegida.                                       |
| **Multi-tenant**     | `TENANCY_MODE=single\|row`                        | Não existe `schema` no env do v1.                                                                                     |
| **Tenant context**   | `active_org_id` no JWT                            | Usado como contexto; membership no banco continua sendo a autoridade.                                                 |
| **RLS**              | Fora do v1                                        | Documentado como hardening futuro.                                                                                    |
| **Acoplamento**      | API pública > contracts/ports > eventos           | Nenhum módulo importa internals de outro.                                                                             |
| **Module registry**  | Plataforma obrigatória + módulos opcionais        | Evita tratar identity/auth como plugins arbitrários.                                                                  |
| **Storage**          | Local → MinIO → S3-compatible                     | O backend depende de `ObjectStorage`, não do fornecedor.                                                              |
| **Billing**          | Opcional                                          | Stripe implementa `PaymentProvider`.                                                                                  |
| **Email**            | Opcional                                          | SMTP/Jinja2 inicialmente; providers pagos entram como adapters.                                                       |
| **Jobs**             | Taskiq                                            | Redis já existente continua sendo infraestrutura de suporte.                                                          |
| **Cache**            | Abstração existente do Fastro                     | Redis/Memcached conforme necessidade.                                                                                 |
| **Audit**            | Módulo opcional                                   | Append-only para operações sensíveis.                                                                                 |
| **Observabilidade**  | Logs estruturados como base                       | Métricas/tracing entram proporcionalmente à necessidade.                                                              |

---

# 2. Arquitetura Alvo — v2

## 2.1 Árvore de pastas

```text
backend/
└── src/
    ├── core/
    │   ├── contracts/
    │   │   ├── email.py
    │   │   ├── storage.py
    │   │   └── payments.py
    │   ├── errors.py
    │   ├── security/
    │   │   └── hashing.py
    │   ├── settings.py
    │   └── module_registry.py
    │
    ├── infrastructure/
    │   ├── auth/
    │   │   ├── hashing.py
    │   │   ├── jwt.py
    │   │   ├── refresh_tokens.py
    │   │   └── throttling.py
    │   │
    │   ├── db/
    │   ├── cache/
    │   ├── storage/
    │   │   ├── local.py
    │   │   ├── minio.py
    │   │   └── s3.py
    │   ├── email/
    │   └── observability/
    │
    └── modules/
        ├── identity/
        │   ├── models.py
        │   ├── schemas.py
        │   ├── service.py
        │   ├── router.py
        │   ├── dependencies.py
        │   ├── public.py
        │   └── tests/
        │
        ├── organization/
        │   ├── models.py
        │   ├── schemas.py
        │   ├── service.py
        │   ├── router.py
        │   └── public.py
        │
        ├── tenancy/
        │   ├── dependencies.py
        │   ├── repository.py
        │   └── policies.py
        │
        ├── entitlements/
        │
        ├── billing_stripe/
        │
        ├── audit/
        │
        └── notifications_email/
```

### Regra estrutural

A arquitetura segue:

```text
interfaces
    ↓
modules / application
    ↓
core contracts
    ↓
infrastructure adapters
```

A composição da aplicação decide quais adapters concretos satisfazem cada contract.

Um módulo não deve depender diretamente de:

* Stripe;
* Redis;
* SMTP;
* S3;
* `FastAPI.Request`;
* detalhes de infraestrutura de outro módulo.

Quando uma dependência externa é necessária, ela deve atravessar uma fronteira explícita.

---

# 2.2 Regra de acoplamento entre módulos

Módulos não importam **internals** uns dos outros.

Isso significa que um módulo não pode importar diretamente:

```text
models.py
repository.py
service.py
dependencies.py
```

de outro módulo.

Dependências entre módulos ocorrem somente por:

1. **API pública** — `modules/<name>/public.py`;
2. **contracts/ports** — contratos em `core/contracts/`;
3. **eventos assíncronos** — Taskiq para acoplamento fraco.

### DAG dos módulos core

A dependência entre módulos core deve formar um DAG:

```text
identity
    ↓
organization
    ↓
tenancy
    ↓
entitlements
```

A seta representa **dependência/importação permitida**, não ordem de inicialização.

Portanto:

```text
organization pode depender de identity
tenancy pode depender de organization
entitlements pode depender de tenancy
```

mas:

```text
identity NÃO pode depender de organization
organization NÃO pode depender de tenancy
tenancy NÃO pode depender de entitlements
```

Módulos opcionais são folhas:

```text
                  ┌── billing_stripe
                  │
identity → organization → tenancy → entitlements
                  │
                  ├── audit
                  │
                  └── notifications_email
```

Eles podem consumir APIs públicas dos módulos core, mas nenhum módulo core depende da existência deles.

Essa regra deve ser validada pelo CI usando `import-linter`.

---

# 2.3 `module_registry.py`

A separação deve representar **o que é estruturalmente obrigatório** e **o que é realmente opcional**.

```python
PLATFORM_MODULES = [
    "identity",
    "organization",
    "tenancy",
    "entitlements",
    "health",
]

OPTIONAL_MODULES = [
    "billing_stripe",
    "audit",
    "notifications_email",
    "storage_s3",
    "ai",
]
```

Somente módulos realmente plugáveis são controlados por:

```text
ENABLED_MODULES=billing_stripe,audit,notifications_email
```

`identity`, `organization`, `tenancy`, `entitlements` e `health` não devem ser tratados como plugins arbitrários.

### Entitlements

`entitlements` permanece como **core leve**:

* tabela simples;
* dependency de autorização;
* nenhum fornecedor de billing obrigatório;
* pode existir mesmo sem Stripe.

Isso permite que:

```text
entitlement = "projects.max"
```

ou:

```text
entitlement = "ai.enabled"
```

seja avaliado independentemente de qualquer sistema de cobrança.

---

# 3. Auth Core v2

## 3.1 Componentes

```text
infrastructure/auth/
├── hashing.py
├── jwt.py
├── refresh_tokens.py
└── throttling.py
```

### `hashing.py`

Argon2id via `pwdlib`.

A política padrão é:

```text
novo sistema → Argon2id
sistema legado → bcrypt somente quando necessário para migração
```

A configuração final deve ser calibrada no hardware-alvo, respeitando as recomendações da OWASP e mantendo o custo de autenticação aceitável para o servidor.

---

## 3.2 JWT

Access token:

```text
alg = HS256
ttl = 10–15 minutos
```

Claims mínimos:

```json
{
  "sub": "user-id",
  "type": "access",
  "iat": 0,
  "exp": 0,
  "iss": "fast-backend",
  "aud": "fast-backend-api",
  "jti": "token-id",
  "active_org_id": "organization-id"
}
```

`issuer` e `audience` devem ser validados pelo backend.

### Por que HS256?

Porque o v1 é um **monólito**.

Não existe necessidade atual de:

```text
serviço A assina
serviço B verifica
serviço C verifica
```

Logo, RS256 introduziria gerenciamento de chave assimétrica sem benefício operacional imediato.

RS256 pode ser introduzido posteriormente sem alterar o modelo conceitual de `CurrentPrincipal`.

---

# 3.3 Refresh token

Refresh token:

```text
- opaco
- criptograficamente aleatório
- nunca JWT
- nunca armazenado em texto puro
- armazenado somente como hash
- persistido no PostgreSQL
```

Tabela:

```text
refresh_tokens
────────────────────────────────
id
user_id
token_hash
family_id
created_at
expires_at
used_at
revoked_at
replaced_by
ip
user_agent
```

---

# 3.4 Rotation + reuse detection

Fluxo:

```text
login
  ↓
family_id = F1
  ↓
R1 criado
  ↓
hash(R1) salvo
  ↓
access token emitido
```

Refresh:

```text
/auth/refresh(R1)
        ↓
BEGIN
        ↓
localiza R1
        ↓
LOCK / UPDATE ATÔMICO
        ↓
válido?
  ├── não → rejeita
  └── sim
        ↓
marca R1.used_at
        ↓
cria R2
        ↓
R1.replaced_by = R2
        ↓
COMMIT
        ↓
retorna access + R2
```

A operação deve ser atomicamente consumível.

Não é suficiente fazer:

```python
if not token.used_at:
    token.used_at = now()
```

porque duas requisições concorrentes podem observar o token antes da alteração.

A operação deve utilizar uma transação PostgreSQL com lock de linha, `UPDATE ... WHERE ...` apropriado ou estratégia equivalente. PostgreSQL garante bloqueio de linhas selecionadas com `FOR UPDATE` até o fim da transação.

### Reuse

Se:

```text
R1.used_at != NULL
```

e alguém tenta reutilizar R1:

```text
REUSE DETECTED
       ↓
revoga family_id = F1
       ↓
R2 também deixa de funcionar
       ↓
usuário precisa autenticar novamente
```

Esse comportamento protege contra replay de refresh token. A rotação de refresh tokens é uma das estratégias recomendadas pela OWASP para detectar/reduzir replay.

---

# 3.5 Revogação global dos access tokens

JWT access token é stateless.

Por isso, para revogação imediata sem manter uma blocklist Redis:

```text
users.tokens_valid_after
```

Exemplo:

```text
tokens_valid_after = 2026-09-11 04:00
```

Todo access token possui:

```text
iat
```

`CurrentPrincipal` deve verificar:

```text
token.iat >= user.tokens_valid_after
```

Essa regra pertence **exclusivamente à resolução de `CurrentPrincipal`**, nunca às rotas individuais.

Eventos como:

```text
logout global
ban
alteração crítica de credenciais
comprometimento da conta
```

fazem:

```sql
UPDATE users
SET tokens_valid_after = now()
WHERE id = :user_id;
```

---

# 3.6 `CurrentPrincipal`

Fluxo:

```text
Authorization: Bearer <JWT>
          ↓
JWT verification
          ↓
signature
issuer
audience
expiration
token type
          ↓
CurrentPrincipal
          ↓
load current user state
          ↓
validate tokens_valid_after
          ↓
principal
```

`CurrentPrincipal` é a abstração usada pelo restante da aplicação.

Nenhum módulo deve precisar saber se o principal veio de:

```text
JWT
session
API key
OAuth
passkey
```

Extensões futuras podem usar a mesma interface.

---

# 3.7 Identity

```text
modules/identity/
├── models.py
├── schemas.py
├── service.py
├── router.py
├── dependencies.py
└── public.py
```

### Domínio

```text
User
Credential
```

### Service

```text
AuthenticationService
```

responsável por:

```text
register
login
refresh
logout
change_password
invalidate_tokens
```

O domínio/application service:

```text
NÃO levanta HTTPException
```

Erros de aplicação são transformados em respostas HTTP exclusivamente na camada `interfaces`.

---

# 4. Tenancy v2 — defesa em profundidade

## 4.1 Modelo

O v1 suporta apenas:

```text
TENANCY_MODE=single
TENANCY_MODE=row
```

### `single`

Existe apenas um tenant lógico.

A infraestrutura continua compatível com tenancy, mas o contexto pode ser resolvido automaticamente.

### `row`

Cada entidade tenant-scoped possui:

```text
tenant_id
```

O banco continua sendo compartilhado.

Não existe no v1:

```text
schema-per-tenant
database-per-tenant
```

Essas estratégias ficam documentadas como opções futuras.

---

# 4.2 `active_org_id` no JWT

O access token pode carregar:

```json
{
  "active_org_id": "org-123"
}
```

Mas:

> **`active_org_id` é contexto, não autoridade.**

A autoridade real continua sendo:

```text
JWT user_id
       ↓
CurrentPrincipal
       ↓
Membership no PostgreSQL
       ↓
CurrentTenant
```

Portanto, se o usuário perder a membership entre dois requests, o JWT antigo não pode continuar garantindo acesso somente porque possui o `org_id`.

### Troca de organização

Endpoint conceitual:

```text
POST /auth/switch-organization
```

Fluxo:

```text
usuário autenticado
        ↓
solicita org B
        ↓
valida Membership
        ↓
org B autorizada?
        ↓
emite novo access token
        ↓
active_org_id = org B
```

Isso mantém o contexto de organização dentro do token sem transformar o claim em autoridade autônoma.

---

# 4.3 Enforcement

```text
JWT
 │
 │ user_id + active_org_id
 ↓
CurrentPrincipal
 │
 ↓
Membership validation
 │
 ↓
CurrentTenant
 │
 ↓
Application Service
 │
 ↓
TenantScopedRepository(tenant_id)
 │
 ↓
SQL
 │
 └── WHERE tenant_id = :tenant_id
```

`TenantScopedRepository` não deve expor métodos padrão de leitura que não recebam ou carreguem `tenant_id`.

O acesso cross-tenant administrativo deve exigir um contexto explícito:

```text
SuperuserContext
```

O bypass deve ser visível no código.

Nunca pode acontecer implicitamente.

---

# 4.4 Segunda camada opcional: PostgreSQL RLS

RLS fica **fora do v1**.

Não deve bloquear a implementação inicial.

Fica registrado como hardening futuro caso:

* um cliente exija isolamento ainda mais forte;
* a criticidade dos dados justifique;
* a complexidade operacional seja aceitável.

Caso RLS seja adotado futuramente, será necessário revisar a estratégia de connection pooling antes de ativá-lo.

Não existe decisão de PgBouncer/RLS necessária para o v1.

---

# 4.5 Teste de tenant isolation

Este teste deve ser de integração usando PostgreSQL real via Testcontainers.

```python
@pytest.mark.integration
async def test_tenant_never_sees_data_from_another_tenant(
    client,
    db_session,
    org_factory,
    resource_factory,
):
    org_a = await org_factory(name="Org A")
    org_b = await org_factory(name="Org B")

    resource_a = await resource_factory(
        tenant_id=org_a.id,
        name="segredo-a",
    )

    resource_b = await resource_factory(
        tenant_id=org_b.id,
        name="segredo-b",
    )

    client_as_a = await client.authenticated_as(org=org_a)

    response = await client_as_a.get("/resources")

    assert all(
        item["id"] != str(resource_b.id)
        for item in response.json()
    )

    direct_response = await client_as_a.get(
        f"/resources/{resource_b.id}"
    )

    assert direct_response.status_code in (403, 404)
```

Esse teste precisa cobrir pelo menos:

```text
list
get by ID
update by ID
delete by ID
```

Não basta testar somente listagem.

---

# 5. Roadmap v2 — 9 fases

| Fase                                                  | Escopo                                                                                                                                                                                                | Critério de aceite                                                                                                                                                          |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0 — Baseline**                                      | Fork/rename; remover `crudauth` do dependency tree; preservar histórico Git; CI original funcionando.                                                                                                 | `uv sync` sem `crudauth`; CI verde.                                                                                                                                         |
| **1 — Fundação de Auth**                              | Argon2id, JWT access, refresh opaco PostgreSQL, rotation, family/reuse detection, atomicidade contra concorrência, `tokens_valid_after`, throttling, `CurrentPrincipal`, logging mínimo e `/healthz`. | Rotation funciona; duas requisições concorrentes não consomem R1 duas vezes; reuse revoga family; `tokens_valid_after` invalida access tokens antigos; throttling funciona. |
| **2 — Hardening**                                     | Security headers, CORS por ambiente, `/readyz`, validação de ambiente, `import-linter`, regras arquiteturais no CI.                                                                                   | CI falha diante de dependência arquitetural proibida; configuração insegura de produção é rejeitada.                                                                        |
| **3 — Identity / Organization / Tenancy**             | Registro, identidade, organization, membership, `CurrentTenant`, `TenantScopedRepository`.                                                                                                            | Tenant isolation e ataques IDOR passam nos testes de integração.                                                                                                            |
| **4 — RBAC + Entitlements**                           | Owner/admin/member; `require_role`; `require_entitlement`.                                                                                                                                            | Usuário sem membership recebe 403; feature sem entitlement recebe 403; funciona sem billing.                                                                                |
| **5 — Email + Storage + Jobs/Idempotência**           | `EmailSender`, SMTP + Jinja2, Taskiq, idempotency records, local storage, MinIO.                                                                                                                      | Mesma operação lógica não é agendada duas vezes; upload local funciona sem MinIO; tarefas têm retry controlado.                                                             |
| **6 — Auditoria + Observabilidade avançada + Backup** | Audit append-only; métricas opcionais; backup automatizado; restore drill.                                                                                                                            | Ação sensível gera auditoria; backup restaura em ambiente limpo.                                                                                                            |
| **7 — Billing Stripe opcional**                       | `PaymentProvider`, Stripe Adapter, webhook idempotente, sincronização com entitlements.                                                                                                               | Webhook repetido produz um único efeito lógico; billing pode ser desativado sem quebrar o core.                                                                             |
| **8 — CI/CD + Template + Docs finais**                | Build → push → deploy → migrate → healthcheck → rollback; documentação; bootstrap de segundo projeto.                                                                                                 | Segundo projeto é criado seguindo apenas a documentação; deploy e rollback são reproduzíveis.                                                                               |

---

# 6. Estratégia TDD

## 6.1 Pirâmide

Proporção inicial aproximada:

```text
             E2E
           /-----\
          /       \
         / Integration \
        /---------------\
       /       Unit       \
      /-------------------\
```

Referência prática:

```text
70% unit
25% integration
5% e2e
```

Isso é uma orientação, não uma regra rígida.

Quanto maior o risco da funcionalidade, maior deve ser a proporção de testes reais.

---

# 6.2 Estrutura

```text
backend/tests/
├── unit/
├── integration/
├── e2e/
├── fixtures/
└── conftest.py
```

Markers:

```text
unit
integration
e2e
slow
security
```

Testcontainers:

```text
PostgreSQL
Redis
```

sempre que o comportamento testado depender efetivamente dessas tecnologias.

---

# 6.3 Cobertura

Meta inicial:

```text
>= 80%
```

Mas cobertura global não substitui cobertura de risco.

Maior rigor deve existir em:

```text
auth
tenancy
RBAC
billing
webhooks
idempotency
security
```

---

# 6.4 Teste-guia — refresh reuse

```python
@pytest.mark.integration
async def test_refresh_reuse_revokes_entire_family(
    client,
    db_session,
    user_factory,
):
    user = await user_factory(
        email="a@b.com",
        password="Str0ng!Pass",
    )

    login = await client.post(
        "/auth/login",
        json={
            "email": user.email,
            "password": "Str0ng!Pass",
        },
    )

    r1 = login.json()["refresh_token"]

    first_rotation = await client.post(
        "/auth/refresh",
        json={"refresh_token": r1},
    )

    assert first_rotation.status_code == 200

    r2 = first_rotation.json()["refresh_token"]

    reuse_attempt = await client.post(
        "/auth/refresh",
        json={"refresh_token": r1},
    )

    assert reuse_attempt.status_code == 401

    r2_after_reuse = await client.post(
        "/auth/refresh",
        json={"refresh_token": r2},
    )

    assert r2_after_reuse.status_code == 401
```

Deve existir também um teste específico de concorrência:

```text
R1
├── request A
└── request B

resultado esperado:

somente uma rotação bem-sucedida
```

---

# 6.5 Teste-guia — tenant isolation

Ver §4.5.

Obrigatório usar PostgreSQL real.

Mock de repository não é suficiente para validar a propriedade de isolamento.

---

# 6.6 Teste-guia — webhook idempotente

Conceito:

```text
provider_event_id
        ↓
unique constraint
        ↓
processamento único
        ↓
side effect único
```

Exemplo:

```text
Stripe event evt_123
       ↓
delivery #1 → processa
delivery #2 → detecta duplicidade
delivery #3 → detecta duplicidade
```

Resultado:

```text
evento registrado 1x
efeito de negócio aplicado 1x
```

---

# 7. Idempotência e Outbox

Idempotência será tratada como capacidade transversal.

Para operações assíncronas sensíveis, utilizar uma persistência de intenção/resultado semelhante a:

```text
outbox_messages
────────────────────────
id
type
aggregate_id
idempotency_key
payload
status
attempts
created_at
processed_at
```

A aplicação deve garantir:

```text
mesma idempotency_key
        ↓
mesma operação lógica
```

Isso **não significa** que um provedor externo necessariamente garantirá entrega física única.

Por exemplo:

```text
Taskiq
 ↓
SMTP
 ↓
provider aceita
 ↓
network timeout
 ↓
worker interpreta como falha
```

Nesse cenário, um retry pode acontecer depois que o provider já recebeu a mensagem.

Logo, o sistema promete:

> **não executar duas vezes a mesma operação lógica dentro do próprio backend quando a idempotência puder ser garantida localmente.**

Não promete, por si só:

> exatamente uma mensagem fisicamente entregue por qualquer provider externo.

---

# 8. Storage

## 8.1 Contrato

```python
class ObjectStorage(Protocol):
    async def put(...): ...
    async def get(...): ...
    async def delete(...): ...
    async def exists(...): ...
    async def presigned_url(...): ...
```

Adapters:

```text
LocalFilesystemStorage
MinIOStorage
S3Storage
```

Arquitetura:

```text
module
  ↓
ObjectStorage
  ↓
adapter
```

Nunca:

```text
module
  ↓
boto3
```

---

# 9. Email

Contrato:

```text
EmailSender
```

Implementação inicial:

```text
Jinja2
+
SMTP
+
aiosmtplib
```

Desenvolvimento:

```text
Mailpit
```

Produção:

```text
SMTP / provider externo
```

Exemplos futuros:

```text
Resend
SES
Postmark
SendGrid
```

O módulo de aplicação não conhece o fornecedor.

---

# 10. Billing

Billing não pertence ao core.

```text
billing_stripe/
```

implementa:

```text
PaymentProvider
```

Fluxo:

```text
Stripe
   ↓
Webhook
   ↓
Idempotency
   ↓
Billing
   ↓
Entitlements
```

O core sabe o que significa:

```text
entitlement = "ai.enabled"
```

mas não precisa saber:

```text
Stripe Subscription
Price ID
Checkout Session
```

---

# 11. Auditoria

Modelo conceitual:

```text
audit_log
────────────────────────
id
tenant_id
actor_user_id
action
resource_type
resource_id
metadata
ip
user_agent
created_at
```

Características:

```text
append-only
```

Não registrar indiscriminadamente tudo.

Priorizar:

```text
login
logout global
alteração de senha
alteração de membership
alteração de role
alteração de billing
alteração de entitlement
operações administrativas
```

---

# 12. Observabilidade

## Base obrigatória

```text
structured logs
request_id
health
readiness
error handling centralizado
```

## Futuro/proporcional

```text
Prometheus
Grafana
OpenTelemetry
distributed tracing
```

Não instalar uma stack inteira de observabilidade antes de existir necessidade operacional.

---

# 13. Production-ready VPS

A checklist da v1 permanece válida:

### Segurança

```text
HTTPS
secure cookies quando utilizados
HttpOnly
SameSite
CSRF quando houver autenticação baseada em cookie
CORS explícito
trusted hosts
trusted proxy configuration
rate limiting
brute-force protection
security headers
secrets fora do Git
containers sem root quando possível
Postgres não exposto publicamente
Redis não exposto publicamente
```

Nunca registrar:

```text
passwords
refresh tokens
access tokens
API secrets
Stripe secrets
```

---

# 14. Backup

Estratégia inicial sugerida:

```text
PostgreSQL dump
↓
compress
↓
encrypt
↓
off-site storage
```

Retenção inicial pode ser parametrizada por ambiente.

A regra mais importante não é apenas:

```text
backup exists
```

mas:

```text
backup restores
```

Por isso:

```text
backup
+
restore drill
```

fazem parte do acceptance criterion.

---

# 15. CI/CD

Pipeline:

```text
Pull Request
   ↓
ruff
   ↓
mypy
   ↓
unit tests
   ↓
integration tests
   ↓
security checks
   ↓
build image
```

Produção:

```text
merge
 ↓
build immutable image
 ↓
push registry
 ↓
deploy VPS
 ↓
database migration
 ↓
health check
 ↓
traffic
```

Nunca depender de:

```text
docker pull latest
```

Preferir:

```text
fast-backend:git-sha
```

Rollback:

```text
previous immutable image
```

Database migrations devem seguir estratégia expand/contract quando houver incompatibilidade entre versões.

---

# 16. Documentação

## README

O README responde:

```text
O que é?
Como iniciar?
Como executar localmente?
Como testar?
Como fazer build?
Como fazer deploy básico?
```

## `docs/`

```text
docs/
├── architecture/
├── development/
├── deployment/
├── modules/
├── guides/
└── adr/
    ├── 0001-remove-crudauth.md
    └── 0002-tenancy-model.md
```

## ADRs

Toda decisão estrutural difícil de reverter deve virar ADR.

Exemplos:

```text
remove crudauth
tenancy model
JWT strategy
storage strategy
billing abstraction
```

---

# 17. AI-agent friendly codebase

O projeto deve ser navegável por agentes de IA sem depender de conhecimento implícito dos autores.

Regras:

```text
estrutura previsível
naming consistente
contracts explícitos
ADR para decisões
README operacional
tests como documentação executável
módulos autocontidos
```

Adicionar:

```text
AGENTS.md
```

na raiz.

Opcionalmente:

```text
modules/<module>/AGENTS.md
```

quando um módulo tiver regras específicas.

Um agente deve conseguir responder:

```text
onde fica a regra?
qual módulo é responsável?
qual contract é usado?
onde está o teste?
qual decisão arquitetural justifica isso?
```

sem procurar aleatoriamente pelo projeto.

---

# 18. Como adicionar um módulo

Objetivo:

> adicionar/remover módulo em menos de 5 passos principais.

### Adicionar

```text
1. Criar modules/<name>
2. Definir API pública/contracts/schemas
3. Criar adapters de infraestrutura necessários
4. Registrar router/dependencies no composition root
5. Criar migration + testes + documentação
```

### Remover

```text
1. Desregistrar módulo
2. Remover configuração/env
3. Remover adapters/contracts exclusivos
4. Remover migration/modelos específicos quando possível
5. Remover testes/documentação do módulo
```

Um módulo removido não deve deixar dependências ocultas no restante do sistema.

---

# 19. Convenções de nomenclatura

### Entidades

```text
User
Organization
Membership
```

### Schemas

```text
UserCreate
UserUpdate
UserRead
OrganizationCreate
```

### Services

```text
UserService
OrganizationService
AuthenticationService
```

### Contracts

```text
EmailSender
ObjectStorage
PaymentProvider
```

### Adapters

```text
SmtpEmailSender
LocalFilesystemStorage
MinIOStorage
S3Storage
StripePaymentProvider
```

### Exceptions

```text
InvalidCredentialsError
RefreshTokenReuseError
TenantAccessDeniedError
EntitlementDeniedError
```

Nunca:

```python
raise HTTPException(...)
```

dentro do domínio/application.

---

# 20. Security boundaries

A aplicação deve distinguir:

```text
authentication
authorization
tenant isolation
feature entitlement
audit
```

São problemas diferentes.

Exemplo:

```text
JWT válido
```

não significa automaticamente:

```text
pode acessar esse tenant
```

e:

```text
pode acessar tenant
```

não significa:

```text
pode executar essa operação
```

e:

```text
pode executar a operação
```

não significa:

```text
possui entitlement da feature
```

Fluxo:

```text
Authentication
       ↓
Membership / Tenant
       ↓
Authorization / RBAC
       ↓
Entitlement
       ↓
Operation
       ↓
Audit
```

---

# 21. Lista explícita de não-fazer agora

Não adicionar ao core v1:

```text
Kubernetes
microservices
Kafka
event sourcing
CQRS completo
schema-per-tenant
database-per-tenant
custom event bus
distributed feature flag platform
full service mesh
multi-cloud orchestration
AI obrigatório
Stripe obrigatório
React obrigatório
RLS obrigatório
OpenTelemetry obrigatório
```

Também evitar:

```text
repository abstraction para absolutamente tudo
DDD excessivamente formal
dozens of tiny infrastructure interfaces
```

A abstração deve existir quando resolve um problema real.

---

# 22. Resultado arquitetural

O `fast-backend` deve ser entendido como:

> **Modular Monolith Async FastAPI SaaS Kernel**

com:

```text
FastAPI
+
Pydantic
+
SQLAlchemy Async
+
PostgreSQL
+
Alembic
+
Redis quando necessário
+
Taskiq quando necessário
+
JWT + refresh
+
Identity
+
Organization
+
Tenancy
+
RBAC
+
Entitlements
```

e extensões:

```text
Billing
Email
Storage
Audit
AI
```

como módulos independentes.

A direção arquitetural final é:

```text
                     ┌─────────────────────┐
                     │      Interfaces     │
                     │  FastAPI / HTTP     │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │      Modules        │
                     │ Identity            │
                     │ Organization        │
                     │ Tenancy             │
                     │ Entitlements        │
                     └──────────┬──────────┘
                                │
                         contracts
                                │
                                ▼
                     ┌─────────────────────┐
                     │   Infrastructure    │
                     │ PostgreSQL          │
                     │ Redis               │
                     │ Taskiq              │
                     │ SMTP                │
                     │ Storage             │
                     │ JWT                 │
                     └─────────────────────┘
```

Com módulos opcionais acoplados pelas fronteiras públicas:

```text
                  ┌── billing_stripe
                  │
Identity ──────── Organization ─────── Tenancy ─────── Entitlements
                  │
                  ├── audit
                  │
                  ├── notifications_email
                  │
                  ├── storage_s3
                  │
                  └── ai
```

---

# 23. Decisões finais da v2

Não existem mais decisões bloqueantes das quatro perguntas originais.

```text
1. Password hashing
   → Argon2id

2. JWT
   → HS256

3. Organization context
   → active_org_id no JWT
   → membership no PostgreSQL é a autoridade
   → troca de organização emite novo access token

4. PostgreSQL RLS
   → fora do v1
   → considerado futuramente como hardening
```

Decisão adicional obrigatória:

```text
5. Refresh concurrency
   → operação atomicamente consumível no PostgreSQL
   → uma rotação válida por refresh token
   → reuse revoga a family
```

Decisão adicional:

```text
6. Idempotência
   → garantia de operação lógica única dentro do backend
   → não prometer entrega física exactly-once em providers externos
```



1. Nomenclatura: v2 usa PLATFORM_MODULES, plano anterior usava CORE_MODULES — congelo em PLATFORM_? Pode usar CORE_MODULES
2. references/ hoje só tem implementation_v2.md (a v1 sumiu) — mantenho só v2 como referência congelada? sim
3. Confirmo openspec init + docs/SKILLS-REGISTRY.md como próximos passos executáveis ao sair do plan-mode? sim.