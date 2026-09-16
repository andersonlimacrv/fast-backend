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

**Adições da Fase 9 (admin + recovery):** `BOOTSTRAP_KEY` (≥32, obrigatória em prod — auditoria do root), `ADMIN_ENABLED=true` (flag do módulo folha), `PASSWORD_RESET_TTL_MINUTES` (padrão 60), `FRONTEND_URL=https://...` (https obrigatório em prod — links de reset), `SOCIAL_LOGIN_ENABLED=false` (só contrato). SMTP prod p/ host remoto exige `SMTP_USE_TLS=true` (Mailpit dev em `localhost:1025` isento).

## Bootstrap do root (one-shot, change A)

```bash
# no VPS / container com o .env de produção (BOOTSTRAP_KEY definida):
uv run python scripts/bootstrap_root.py --email root@example.com
# ou: make admin-bootstrap   (BOOTSTRAP_KEY + ROOT_EMAIL do env, senha via prompt)
```

Falha-fechada: key errada OU root existente → `bootstrap failed` genérico, exit 1 (nunca revela qual). A 2ª execução sempre falha (índice parcial `uq_single_root`). Auditado como `root.bootstrap`.

## Operação do recovery (change B)

- Self-service: `POST /auth/password/forgot` (sempre `202 accepted`) → outbox `email.template` → worker renderiza `password_reset.*` e envia → payload redigido após envio. Dev: `make tools` (Mailpit UI `:8025`, SMTP `:1025`).
- Admin: `POST /admin/users/{id}/force-password-reset` (`reason`, staff+) retorna `{status:accepted}` sem segredos.
- Manutenção: Taskiq `password.purge` (linhas expiradas/usadas); agendar beat/cron junto ao backup.

## Deploy (automático via push na main)

1. Build `:sha` → push GHCR → SSH → `migrate` (`alembic upgrade head`) → `up app+worker` → 30× `GET /readyz`.
2. Falhou? Rollback automático p/ `.deploy-sha` anterior + job vermelho.
3. Manual: workflow `rollback` com a SHA (ou no host: `IMAGE=... up -d`).

Migrations seguem expand/contract quando houver incompatibilidade entre versões.

## Releases (automático a cada PR merged)

Merge na `main` roda o `auto-release.yml`: `[Unreleased]` é finalizado em `## [vX.Y.Z] — data` (patch a partir da maior tag; minor/major via dispatch manual), arquivos de versão sincronizam, commit + tag com push, e o `release.yml` cria o GitHub Release a partir da seção. Rollback de release ruim: deleta tag e Release no GitHub e dá `git revert` no commit `chore(release)`. Nunca force-push.

## Operações de privacidade

- Contato do DPO: `PRIVACY_CONTACT` (sem default — definir antes da produção).
- Incidente? Seguir `.lgpd/incidents/runbook.md` (3 dias úteis p/ ANPD + titulares; log de 5 anos em `.lgpd/incidents/log.md`).
- DPAs de vendors em `.lgpd/vendors/` — sem tráfego produtivo p/ vendor sem DPA assinado.

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
