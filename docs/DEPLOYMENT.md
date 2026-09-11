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

## Deploy (automatic on push to main)

1. Build `:sha` → push GHCR → SSH → `migrate` (`alembic upgrade head`) → `up app+worker` → 30× `GET /readyz`.
2. Failed? Automatic rollback to previous `.deploy-sha` + red job.
3. Manual: `rollback` workflow with the SHA (or on the host: `IMAGE=... up -d`).

Migrations follow expand/contract when versions are incompatible.

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
