# Aviso de Privacidade — fast-backend

> 🇧🇷 Português (BR) | [English](PRIVACY.md)
>
> Aviso voltado a desenvolvedores deste boilerplate (orientado à LGPD). Ajuste `PRIVACY_CONTACT` e retenção antes da produção. Não é aconselhamento jurídico.

## Inventário de dados (o que é guardado, onde)

| Dado | Tabela / local | Finalidade | Base legal (LGPD) |
|---|---|---|---|
| Email | `users.email` | Identidade da conta, login, entrega de recovery | Contrato / legítimo interesse |
| Hash de senha (Argon2id; bcrypt só verificação legada) | `credentials.password_hash` | Autenticação — texto puro nunca guardado | Contrato |
| Flags (`is_active`, `is_superuser`, `is_staff`) | `users` | Controle de acesso | Legítimo interesse |
| **Hashes** de refresh token + elos de família | `refresh_tokens{token_hash,family_id,used_at,revoked_at,replaced_by}` | Rotação de sessão + detecção de reuse | Contrato |
| **Hashes** de token de reset | `password_resets{token_hash,expires_at,used_at}` | Recovery de uso único | Contrato |
| IP + user-agent | `refresh_tokens`, `password_resets`, `audit_log` | Detecção de abuso, trilha de auditoria | Legítimo interesse |
| Metadados de auditoria (`reason`, contexto) | `audit_log.metadata` | Responsabilização de ações privilegiadas | Obrigação legal / legítimo interesse |
| Payloads da fila de email | `outbox_messages` | Entrega confiável; **token redigido após envio** | Contrato |
| Nomes/slugs de orgs/projetos, papéis | `organizations`, `memberships`, `projects`, grants | Tenancy e autorização | Contrato |
| Cookies de sessão (`access_token`, `refresh_token`: `HttpOnly`) | cookies do navegador, só com `AUTH_COOKIE_ENABLED=true` | Transporte de sessão da SPA (JS não lê) | Contrato |
| Cookie CSRF (`csrf_token`, legível) + header `X-CSRF-Token` | cookie + header, só com `AUTH_COOKIE_ENABLED=true` | Proteção anti-forgery das mutações por cookie | Legítimo interesse |

Nunca em logs ou auditoria: senhas, tokens (access/refresh/reset), segredos. Tokens existem **só como hash** no Postgres; o token de reset vive minutos no payload do outbox e é redigido após o despacho (provado por `test_leak_audit.py`).

## Retenção

- `password_resets`: purge de expirados/usados via Taskiq `password.purge` (agendar junto ao backup).
- `refresh_tokens`: famílias revogadas acumulam; estratégia de purge por deploy (sem auto-delete ainda).
- `audit_log`: append-only, **sem job de retenção ainda** — definir `AUDIT_RETENTION_DAYS` por deploy (follow-up explícito, não implementado).
- Backups herdam o conteúdo do banco; retenção via `scripts/backup.py --retention`.

## Direitos do titular → endpoints

| Direito | Como |
|---|---|
| Acesso (`/auth/me`, próprias orgs) | `GET /auth/me`, `GET /organizations` |
| Correção (senha) | `POST /auth/change-password`, `POST /auth/password/reset` |
| Revogação (sessões) | `POST /auth/logout`, `/logout-everywhere`, admin `revoke-sessions` |
| Eliminação / desativação | staff+ `POST /admin/users/{id}/disable` (contenção); hard delete por política do deploy |
| Portabilidade / dúvidas | contato abaixo |

## Cookies, storage, terceiros

- Sessão no navegador, dois modos: o fluxo header padrão mantém tokens curtos na memória/`localStorage` da SPA (conveniência dev); com `AUTH_COOKIE_ENABLED=true` (transporte de produção) os tokens viajam como cookies `HttpOnly`/`Secure`/`SameSite=Lax` que o JS não lê, mais um synchronizer `csrf_token` legível ecoado em `X-CSRF-Token` nas mutações (`Path=/auth` confina o cookie de refresh a `/auth/*`). Mutação por cookie sem o token recebe `403`. Ver `docs/DEPLOYMENT.pt-BR.md` ("Sessões por cookie + CSRF") p/ o runbook TLS/`Secure`.
- Landing (`/`): sem trackers, sem requisições a terceiros, sem analytics.
- Suboperadores dependem do deploy: provedor SMTP (`EMAIL_BACKEND=smtp`), storage S3-compatível, Stripe (só com `BILLING_ENABLED=true`).

## Contato

Contato do controlador: definir `PRIVACY_CONTACT` no `.env` (sem default de propósito).
