# Discovery LGPD — fast-backend (2026-09-16)

Levantamento técnico (skill `lgpd-legacy-retrofit`, Fase 1). Stack real: FastAPI + SQLAlchemy/Alembic + Postgres, Redis, Taskiq, SMTP/Mailpit, S3/MinIO, Stripe (flag), SPA Vite+React (dev only). Sem Prisma/Better Auth/Next (exemplos do bundle adaptados).

## 1. Schema do banco (Alembic 0001–0008)

| Tabela | Campos com dado pessoal | Observação |
|---|---|---|
| `users` | `email`, flags, `tokens_valid_after`, timestamps | identidade central |
| `credentials` | `password_hash` (Argon2id; bcrypt só legado) | nunca texto puro |
| `refresh_tokens` | só `token_hash` + `family_id`, `used_at/revoked_at/replaced_by`, `ip`, `user_agent` | sem token em repouso |
| `password_resets` | só `token_hash`, `expires_at/used_at`, `ip` | purge via `password.purge` |
| `organizations/memberships/projects` | nomes, slugs, papéis, vínculos | dado operacional |
| `entitlement_grants` | `org_id`, `key`, limite | sem PII direta |
| `audit_log` | `actor_user_id`, `action`, `resource_*`, `metadata(reason)`, `ip`, `user_agent` | append-only, **sem retenção/purge** |
| `outbox_messages` | payloads (redigido pós-envio p/ reset) | janela de minutos com token |

## 2. APIs (42 rotas app + `/meta` público)

Auth (`/auth/*` + recovery), orgs/memberships, projects, grants, audit por-org, `/admin/*` (staff/root), webhook Stripe, `/healthz`, `/readyz`, `/meta` (sem PII, provado por teste anti-vazamento).

## 3. Terceiros / env

SMTP (provedor a definir por deploy), S3/MinIO, Stripe (`BILLING_ENABLED`, off default), Mailpit dev. Segredos só em `.env` (gitignored); `.env.example` sem segredos.

## 4. Frontend

SPA dev: tokens em `localStorage` (documentado dev-only), sem cookies próprios, **zero trackers/CDN/fontes externas** (system fonts), sem analytics. `PRIVACY.md` declara isso.

## 5. Documentos existentes

`docs/PRIVACY.md` (+pt-BR): inventário, base, retenção, direitos→endpoints, cookies, suboperadores, `PRIVACY_CONTACT` (sem default). `test_leak_audit.py`: varredura de segredos em audit/outbox/logs. `SECURITY.md`: seção anti-enumeração.

## 6. Encarregado / incidentes / operadores

- Encarregado: **não designado/publicado** (`PRIVACY_CONTACT` placeholder).
- Incidentes anteriores conhecidos: **nenhum registrado**.
- Operadores com DPA assinado: **nenhum** (SMTP/S3/Stripe por deploy, sem due diligence registrada).
- ECA Digital: **N/A** (ferramenta dev B2B, sem público menor).
- Consentimento marketing: **N/A** (sem coleta p/ marketing; sem cookies de tracking).
