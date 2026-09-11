## Context

Pós-Fase 4: auth/tenancy/RBAC/entitlements prontos, zero capacidade assíncrona. Settings já têm Redis; Postgres é fonte de verdade para estado crítico (padrão do refresh atômico, Fase 1).

## Goals / Non-Goals

**Goals:**
- Envio de email e storage plugáveis por contrato, com defaults que funcionam sem infra extra.
- Garantia de operação lógica única para o que for sensível (email, webhooks futuros).

**Non-Goals:**
- Provedores transacionais pagos, templates finais de produto, large-file uploads.

## Decisions

1. **Outbox em Postgres, não fila como fonte de verdade** — `enqueue` é `INSERT ... ON CONFLICT DO NOTHING` + retorno do existente; workers apenas *reclamam* (`SKIP LOCKED`). Redis/Taskiq transporta, Postgres decide (mesmo padrão do refresh, Fase 1).
2. **Taskiq (já previsto no boilerplate de referência) sobre Redis** — broker `taskiq-redis`; em testes, broker in-memory quando suportado, senão teste no nível do outbox + task como função pura (sem broker). Retry com backoff no nível da task, `attempts` persistido no outbox.
3. **Jinja2 `StrictUndefined`** — variável ausente falha alto em vez de enviar email com buraco.
4. **`aiosmtplib`, não `smtplib`** — async-first; timeout explícito; TLS via STARTTLS configurável.
5. **Local-first storage, S3-compatível por `endpoint_url`** — um adapter `S3CompatibleStorage` cobre MinIO (VPS), AWS S3, R2 e B2 (só troca credencial/endpoint); `presigned_url` delegado ao provider com fallback de erro explícito no local.
6. **Sem `boto3` síncrono no request path** — `aioboto3`; uploads via `put(bytes|stream)` com limite de tamanho em settings.
7. **Módulos nunca importam `aioboto3/aiosmtplib/taskiq`** — só `core/contracts`; composição em `main.py` escolhe adapters por env (`STORAGE_BACKEND=local|s3`, `EMAIL_BACKEND=smtp|log`).

## Risks / Trade-offs

- [Exatamente-uma-vez física impossível] → contrato honesto: lógica única no backend (v2 §7); provedor pode duplicar após timeout — consumers (Fase 7) devem ser idempotentes por `provider_event_id`.
- [aioboto3 pesado (~boto3)] → aceitar: é o padrão async S3; local segue default sem instalá-lo? Não — dep única simplifica; documentar.
- [Mailpit/MinIO indisponíveis no sandbox] → testes `slow` com skip gracioso (`pytest.importorskip`/env), núcleo (local + outbox) sempre verde.
- [Alternativa rejeitada: Celery] → stack mais pesada (kombu/billiard) sem benefício p/ volume v1; Taskiq é nativo async.
