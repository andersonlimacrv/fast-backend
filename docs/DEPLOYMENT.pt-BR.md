# DEPLOYMENT — runbook VPS single-host

> 🇧🇷 Português (BR) | [English](DEPLOYMENT.md)

## Pré-requisitos

VPS com Docker + Compose plugin, DNS apontando p/ o host, GHCR com a imagem `:sha`, `.env` de produção (nunca commitar; auditar contra `.env.example`).

```bash
# no VPS, primeira vez
mkdir -p ~/fast-backend && cd ~/fast-backend
# copiar: docker-compose.prod.yml + .env (SCP ou secrets do CI)
```

## Variáveis críticas de produção

`ENVIRONMENT=production`, `SECRET_KEY` real (≥32), `TRUSTED_HOSTS=[dominio]`, `DATABASE_URL`/`POSTGRES_*`, `REDIS_URL`, `TASK_BROKER_URL`, `CORS_ORIGINS`, `BILLING_ENABLED` + `STRIPE_*` se aplicável. O boot falha alto com config insegura (validado em `Settings`).

## Deploy (automático via push na main)

1. Build `:sha` → push GHCR → SSH → `migrate` (`alembic upgrade head`) → `up app+worker` → 30× `GET /readyz`.
2. Falhou? Rollback automático p/ `.deploy-sha` anterior + job vermelho.
3. Manual: workflow `rollback` com a SHA (ou no host: `IMAGE=... up -d`).

Migrations seguem expand/contract quando houver incompatibilidade entre versões.

## TLS (Caddy externo, exemplo)

```caddyfile
api.seudominio.com {
    reverse_proxy 127.0.0.1:8000
}
```

O compose não termina TLS de propósito (domínio varia por deploy).

## Backup (cron diário sugerido)

```bash
0 3 * * * cd ~/fast-backend && BACKUP_PASSPHRASE="$(cat /run/secrets/backup_pp)" \
  python3 scripts/backup.py --database-url "$DATABASE_URL" --dest ./var/backups --retention 7
```

`BACKUP_PASSPHRASE` fora do repo (secret manager do CI ou `/run/secrets`). Drill: `test_backup_restore_drill` prova seed → backup → drop → restore.

## Observabilidade mínima

`/healthz` (liveness, sem deps) vs `/readyz` (DB+Redis). Logs com `X-Request-ID`. `audit_log` append-only p/ ações sensíveis. Métricas/OTel ficam p/ quando a operação exigir (proporcionalidade).

## Rollback de dados

Imagens são imutáveis; dados não voltam sozinhos: combine rollback de código + restore de backup quando a migration for destrutiva (motivo do expand/contract acima).
