# DEPLOYMENT — single-host VPS runbook

> 🇬🇧 English | [Português (BR)](DEPLOYMENT.pt-BR.md)

## Prerequisites

VPS with Docker + Compose plugin, DNS pointing at the host, GHCR with the `:sha` image, production `.env` (never commit; audit against `.env.example`).

```bash
# on the VPS, first time
mkdir -p ~/fast-backend && cd ~/fast-backend
# copy: docker-compose.prod.yml + .env (SCP or CI secrets)
```

## Critical production variables

`ENVIRONMENT=production`, real `SECRET_KEY` (≥32), `TRUSTED_HOSTS=[domain]`, `DATABASE_URL`/`POSTGRES_*`, `REDIS_URL`, `TASK_BROKER_URL`, `CORS_ORIGINS`, `BILLING_ENABLED` + `STRIPE_*` if applicable. Boot fails fast on insecure config (validated in `Settings`).

**Phase 9 additions (admin control plane + recovery):** `BOOTSTRAP_KEY` (≥32, required in production — one-shot root audit), `ADMIN_ENABLED=true` (leaf module flag), `PASSWORD_RESET_TTL_MINUTES` (default 60), `FRONTEND_URL=https://...` (https-only in prod — reset links), `SOCIAL_LOGIN_ENABLED=false` (contract only). Production SMTP to a remote host requires `SMTP_USE_TLS=true` (dev Mailpit on `localhost:1025` exempt).

## Root bootstrap (one-shot, change A)

```bash
# on the VPS / container with the production .env (BOOTSTRAP_KEY set):
uv run python scripts/bootstrap_root.py --email root@example.com
# or: make admin-bootstrap   (BOOTSTRAP_KEY + ROOT_EMAIL from env, password via prompt)
```

Fail-closed: wrong key OR existing root → generic `bootstrap failed`, exit 1 (never reveals which). Second run always fails (partial unique index `uq_single_root`). Audited as `root.bootstrap`.

## Password recovery operations (change B)

- Self-service: `POST /auth/password/forgot` (always `202 accepted`) → outbox `email.template` → worker renders `password_reset.*` and sends → payload redacted after send. Dev: `make tools` (Mailpit `:8025` UI, SMTP `:1025`).
- Admin: `POST /admin/users/{id}/force-password-reset` (`reason`, staff+) returns `{status:accepted}` without secrets.
- Maintenance: Taskiq `password.purge` (expired/used rows); suggested beat/cron alongside backup.

## Deploy (automatic on push to main)

1. Build `:sha` → push GHCR → SSH → `migrate` (`alembic upgrade head`) → `up app+worker` → 30× `GET /readyz`.
2. Failed? Automatic rollback to previous `.deploy-sha` + red job.
3. Manual: `rollback` workflow with the SHA (or on the host: `IMAGE=... up -d`).

Migrations follow expand/contract when versions are incompatible.

## Releases (automatic on every merged PR)

Merging to `main` runs `auto-release.yml`: `[Unreleased]` is finalized into `## [vX.Y.Z] — date` (patch bump from the highest tag; minor/major via manual dispatch), version files sync, commit + tag push, and `release.yml` creates the GitHub Release from the section. Rollback of a bad release: delete the tag and Release on GitHub, then `git revert` the `chore(release)` commit. Never force-push.

## Privacy operations

- DPO contact: `PRIVACY_CONTACT` (no default — set before production).
- Incident? Follow `.lgpd/incidents/runbook.md` (3 business days to ANPD + subjects; 5-year log in `.lgpd/incidents/log.md`).
- Vendor DPAs live in `.lgpd/vendors/` — no production traffic to a vendor without a signed DPA.

## TLS (external Caddy, example)

```caddyfile
api.yourdomain.com {
    reverse_proxy 127.0.0.1:8000
}
```

Compose intentionally does not terminate TLS (domain varies per deploy).

## Backup (suggested daily cron)

```bash
0 3 * * * cd ~/fast-backend && BACKUP_PASSPHRASE="$(cat /run/secrets/backup_pp)" \
  python3 scripts/backup.py --database-url "$DATABASE_URL" --dest ./var/backups --retention 7
```

`BACKUP_PASSPHRASE` outside the repo (CI secret manager or `/run/secrets`). Drill: `test_backup_restore_drill` proves seed → backup → drop → restore.

## Minimum observability

`/healthz` (liveness, no deps) vs `/readyz` (DB+Redis). Logs with `X-Request-ID`. Append-only `audit_log` for sensitive actions. Metrics/OTel when operations demand it (proportionality).

## Data rollback

Images are immutable; data doesn't come back alone: combine code rollback + backup restore when the migration is destructive (hence expand/contract above).
