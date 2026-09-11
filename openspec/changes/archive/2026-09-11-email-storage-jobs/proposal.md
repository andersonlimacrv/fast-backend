## Why

Reset de senha, convites e notificações precisam de email; uploads precisam de storage; ambos precisam de execução assíncrona idempotente — sem isso, Fase 6 (auditoria/backup) e Fase 7 (billing/webhooks) não têm onde se apoiar (v2 §§7–9, ROADMAP Fase 5).

## What Changes

- `core/contracts/`: `EmailSender{send(to,subject,html,text)}`, `ObjectStorage{put,get,delete,exists,presigned_url}` — módulos dependem só dos contratos.
- `infrastructure/email/`: `SmtpEmailSender` (Jinja2 templates + `aiosmtplib`), dev via Mailpit, prod via SMTP/provider; sem provider preso no core.
- `infrastructure/storage/`: `LocalFilesystemStorage` (default dev, zero infra) + `S3CompatibleStorage` (MinIO local-VPS, S3/R2 via `endpoint_url` + credencial).
- `infrastructure/jobs/` + `outbox_messages{id,type,aggregate_id,idempotency_key unique,payload,status,attempts,created_at,processed_at}`: `enqueue` (conflito de chave → retorna o existente), `claim` (`FOR UPDATE SKIP LOCKED` → `processing`), `complete`/`fail` (retry com `attempts`, morto após N); tasks Taskiq (`send_email`) consumindo o outbox.
- Migration `0004_outbox`. Deps: `aiosmtplib`, `jinja2`, `aioboto3`, `taskiq`, `taskiq-redis`.

## Capabilities

### New Capabilities

- `email`: contrato + SMTP/Jinja2 + Mailpit em dev.
- `storage`: contrato + local + S3-compatível.
- `jobs-idempotency`: outbox + claim/complete + tasks Taskiq com retry.

### Modified Capabilities

- (vazio)

## Impact

- Novos: `app/core/contracts/`, `app/infrastructure/{email,storage,jobs}/`, migration 0004, 4 deps novas.
- Comportamento existente inalterado; email/storage/jobs ficam disponíveis como base (nenhum fluxo os usa ainda — reset de senha continua Fase futura).
- Sem infra nova obrigatória em dev (local + SQLite? não — Postgres já exigido; Redis já exigido).

## Non-goals (v2 §21)

Provedores pagos (Resend/SES) como padrão, frontend de templates, fila além do Taskiq/Redis, event bus custom, TUS/uploads resumíveis.

## Acceptance criteria (Postgres+Redis reais)

1. Mesma `idempotency_key` enfileirada 2x → 1 registro, 1 efeito (email capturado 1x).
2. Upload/download/delete/presigned no `LocalFilesystemStorage` sem MinIO; S3-compatível validado contra MinIO (teste `slow`, pula sem docker).
3. Task `send_email` com falha transitória → retry até N → `processed`; falha permanente → `dead` após N tentativas.
4. Template inexistente/variável ausente → erro explícito em dev, nunca envio parcial.
5. `lint-imports` verde (novos adapters só atrás de contratos).
