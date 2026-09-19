# Privacy Notice — fast-backend

> 🇬🇧 English | [Português (BR)](PRIVACY.pt-BR.md)
>
> Developer-facing notice for this boilerplate (LGPD-aware). Adapt `PRIVACY_CONTACT` and retention before production. Not legal advice.

## Data inventory (what is stored, where)

| Data | Table / place | Purpose | Legal basis (LGPD) |
|---|---|---|---|
| Email | `users.email` | Account identity, login, recovery delivery | Contract / legitimate interest |
| Password hash (Argon2id; bcrypt verify-only for legacy) | `credentials.password_hash` | Authentication — plaintext never stored | Contract |
| Flags (`is_active`, `is_superuser`, `is_staff`) | `users` | Access control | Legitimate interest |
| Refresh token **hashes** + family links | `refresh_tokens{token_hash,family_id,used_at,revoked_at,replaced_by}` | Session rotation + reuse detection | Contract |
| Reset token **hashes** | `password_resets{token_hash,expires_at,used_at}` | Single-use recovery | Contract |
| IP + user-agent | `refresh_tokens`, `password_resets`, `audit_log` | Abuse detection, audit trail | Legitimate interest |
| Audit metadata (`reason`, action context) | `audit_log.metadata` | Accountability of privileged actions | Legal obligation / legitimate interest |
| Email queue payloads | `outbox_messages` | Reliable delivery; **reset token redacted after send** | Contract |
| Org/project names, slugs, roles | `organizations`, `memberships`, `projects`, grants | Tenancy and authorization | Contract |
| Session cookies (`access_token`, `refresh_token`: `HttpOnly`) | browser cookies, only with `AUTH_COOKIE_ENABLED=true` | SPA session transport (JS cannot read) | Contract |
| CSRF cookie (`csrf_token`, readable) + `X-CSRF-Token` header | browser cookie + request header, only with `AUTH_COOKIE_ENABLED=true` | Mutation forgery protection for cookie sessions | Legitimate interest |

Never stored in logs or audit: passwords, access/refresh/reset tokens, secrets. Tokens exist **hash-only** in Postgres; the reset token lives minutes in the outbox payload and is redacted after dispatch (proven by `test_leak_audit.py`).

## Retention

- `password_resets`: purged expired/used via Taskiq `password.purge` (schedule alongside backup).
- `refresh_tokens`: revoked families accumulate; purge strategy per deploy (no auto-delete yet).
- `audit_log`: append-only, **no retention job yet** — define `AUDIT_RETENTION_DAYS` per deploy (explicit follow-up, not implemented).
- Backups inherit DB contents; retention via `scripts/backup.py --retention`.

## Subject rights → endpoints

| Right | How |
|---|---|
| Access (`/auth/me`, own orgs) | `GET /auth/me`, `GET /organizations` |
| Correction (password) | `POST /auth/change-password`, `POST /auth/password/reset` |
| Revocation (sessions) | `POST /auth/logout`, `/logout-everywhere`, admin `revoke-sessions` |
| Deletion / deactivation | staff+ `POST /admin/users/{id}/disable` (containment); hard delete per deploy policy |
| Portability/questions | contact below |

## Cookies, storage, third parties

- Browser session, two modes: default header flow keeps short-lived tokens in the SPA memory/`localStorage` (dev convenience); with `AUTH_COOKIE_ENABLED=true` (production SPA transport) the tokens travel as `HttpOnly`/`Secure`/`SameSite=Lax` cookies the JS cannot read, plus a readable `csrf_token` synchronizer echoed in `X-CSRF-Token` on mutations (`Path=/auth` confines the refresh cookie to `/auth/*`). Cookie-authenticated mutations without the token get `403`. See `docs/DEPLOYMENT.md` ("Cookie sessions + CSRF") for the TLS/`Secure` runbook.
- Landing (`/`): no trackers, no third-party requests, no analytics.
- Subprocessors depend on deploy: SMTP provider (`EMAIL_BACKEND=smtp`), S3-compatible storage, Stripe (only with `BILLING_ENABLED=true`).

## Contact

Data-controller contact: set `PRIVACY_CONTACT` in `.env` (no default on purpose).
