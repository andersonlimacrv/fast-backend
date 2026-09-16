# Mapa de Dados — fast-backend

**Versão**: v1
**Data**: 2026-09-16
**Owner global**: Encarregado / DPO (pendente designação)

> Método: reverse-engineering do código (skill `lgpd-legacy-retrofit` não tem scanner p/ SQLAlchemy; inventário manual a partir de models, routers e settings). Sem dados sensíveis (Art. 5º, II) e sem menores em nenhuma atividade.

## Atividades de Tratamento

### A001 — conta e autenticação

| Campo | Valor |
|---|---|
| Slug | a001-conta-autenticacao |
| Finalidade | criar e autenticar contas de usuário |
| Base legal | Art. 7º, V — execução de contrato ([detalhes](./legal-basis.md#a001)) |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não |
| Dados | e-mail, hash Argon2id, flags, timestamps |
| Fonte | coletado do titular em `POST /auth/register` |
| Sistemas | `users`, `credentials` (Postgres) |
| Operadores | nenhum |
| Transferência intl. | Não |
| Retenção | enquanto a conta existir + backups (sem purge de usuário; a definir) |
| Segurança | hash Argon2id, anti-enumeração testada, throttling |
| Alto risco? | Sim — credenciais (→ RIPD pendente) |
| RIPD | pendente |
| Owner | backend-implementer |

### A002 — sessões (refresh rotation)

| Campo | Valor |
|---|---|
| Slug | a002-sessoes-refresh |
| Finalidade | manter sessão com rotation e detectar reuse |
| Base legal | Art. 7º, V — execução de contrato |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não |
| Dados | hash de refresh token, family_id, `used_at/revoked_at`, IP, user-agent |
| Fonte | observado no login/refresh |
| Sistemas | `refresh_tokens` (Postgres) |
| Operadores | nenhum |
| Transferência intl. | Não |
| Retenção | famílias revogadas acumulam (sem purge — gap) |
| Segurança | só hash em repouso, `SELECT FOR UPDATE`, reuse revoga família |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | backend-implementer |

### A003 — recovery de senha

| Campo | Valor |
|---|---|
| Slug | a003-recovery-senha |
| Finalidade | redefinir senha via link de uso único |
| Base legal | Art. 7º, V — execução de contrato |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não |
| Dados | e-mail (destinatário), hash de token, IP |
| Fonte | coletado em `POST /auth/password/forgot` |
| Sistemas | `password_resets` (Postgres), `outbox_messages` (redigido pós-envio), SMTP/Mailpit |
| Operadores | provedor SMTP (por deploy) |
| Transferência intl. | Possível (SMTP por deploy — mapear em L4) |
| Retenção | purge via `password.purge` (expirados/usados) |
| Segurança | token só-hash, single-use, anti-enumeração (202 genérico) |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | backend-implementer |

### A004 — organizações e memberships

| Campo | Valor |
|---|---|
| Slug | a004-organizacoes-memberships |
| Finalidade | multi-tenancy e papéis por organização |
| Base legal | Art. 7º, V — execução de contrato |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não |
| Dados | nomes/slugs de orgs, vínculos user↔org, papéis |
| Fonte | coletado do titular + ações de admin |
| Sistemas | `organizations`, `memberships`, `projects` (Postgres) |
| Operadores | nenhum |
| Transferência intl. | Não |
| Retenção | enquanto vínculo existir (sem purge — gap parcial) |
| Segurança | RBAC, isolamento por tenant testado |
| Alto risco? | Não |
| RIPD | N/A |
| Owner | backend-implementer |

### A005 — auditoria de segurança

| Campo | Valor |
|---|---|
| Slug | a005-auditoria |
| Finalidade | accountability de ações sensíveis e privilegiadas |
| Base legal | Art. 7º, IX — legítimo interesse (segurança) + Art. 16, I (guarda de registros) |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não |
| Dados | actor, ação, recurso, `metadata(reason)`, IP, user-agent |
| Fonte | observado em cada ação sensível |
| Sistemas | `audit_log` (Postgres, append-only) |
| Operadores | nenhum |
| Transferência intl. | Não |
| Retenção | **indefinida — gap** (`AUDIT_RETENTION_DAYS` futuro) |
| Segurança | sem UPDATE/DELETE; segredos fora (testado em `test_leak_audit.py`) |
| Alto risco? | Não (mitigado pelos testes) |
| RIPD | N/A |
| Owner | backend-implementer |

### A006 — administração global

| Campo | Valor |
|---|---|
| Slug | a006-admin-global |
| Finalidade | gestão de contas/orgs por staff/root |
| Base legal | Art. 7º, IX — legítimo interesse |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não |
| Dados | mesmos de A001/A004, lidos cross-tenant com `reason` auditado |
| Fonte | base existente (sem coleta nova) |
| Sistemas | Postgres via `SuperuserContext` explícito |
| Operadores | nenhum |
| Transferência intl. | Não |
| Retenção | herda das tabelas de origem |
| Segurança | `require_staff/require_root`, `reason` obrigatório, single-root |
| Alto risco? | Sim — acesso cross-tenant (→ RIPD pendente) |
| RIPD | pendente |
| Owner | backend-implementer |

### A007 — billing Stripe (flag, off default)

| Campo | Valor |
|---|---|
| Slug | a007-billing-stripe |
| Finalidade | aplicar grants a partir de eventos de assinatura |
| Base legal | Art. 7º, V — execução de contrato (quando ligado) |
| Categorias de titulares | usuários adultos (via `org_id` do metadata) |
| Sensíveis? | Não (só IDs e preços; sem cartão — Stripe hospeda) |
| Dados | `event_id`, tipo, `price_id`, `org_id` |
| Fonte | webhook Stripe → outbox `stripe:{id}` |
| Sistemas | `outbox_messages`, `entitlement_grants` |
| Operadores | **Stripe** (quando ligado) |
| Transferência intl. | Sim, potencial (Stripe US — mapear em L4) |
| Retenção | outbox processado acumula (sem purge — gap parcial) |
| Segurança | HMAC + tolerância, idempotência |
| Alto risco? | Não (baixo volume, flag off) |
| RIPD | N/A |
| Owner | backend-implementer |

### A008 — sessão no navegador (SPA dev)

| Campo | Valor |
|---|---|
| Slug | a008-spa-local |
| Finalidade | manter sessão no client de visualização |
| Base legal | Art. 7º, V — execução de contrato |
| Categorias de titulares | usuários adultos |
| Sensíveis? | Não (tokens opacos) |
| Dados | access/refresh tokens em `localStorage` |
| Fonte | login no navegador |
| Sistemas | `localStorage` do navegador (dev only; prod = cookies `HttpOnly`+CSRF) |
| Operadores | nenhum (zero trackers/CDN) |
| Transferência intl. | Não |
| Retenção | até logout/expiração |
| Segurança | documentado como dev-only em `PRIVACY.md` |
| Alto risco? | Não (dev) |
| RIPD | N/A |
| Owner | frontend-implementer |

## Checklist de qualidade
- [x] Toda tabela com FK para `User` está coberta (credentials, memberships, refresh, resets, audit actor)
- [x] Toda integração de terceiro está listada (SMTP, S3/MinIO, Stripe)
- [ ] Toda atividade tem base legal explícita → pendente `legal-basis.md` (L3)
- [x] Alto risco flagado (A001, A006 → RIPD pendente)
- [x] Menores: nenhum em nenhuma atividade (ECA N/A confirmado)
- [ ] Retenção definida (sem "indefinido") → pendente (herdado de gaps.md)
