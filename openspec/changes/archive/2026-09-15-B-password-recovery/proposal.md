## Why

Recovery de senha é parte da identidade (não feature isolada): sem ela, o control plane da change A não consegue desbloquear contas, e usuários sem acesso dependem de intervenção manual. O v1.0.0 só tem template `welcome.*` sem nenhum fluxo. Referência: `references/implementation_v2.md` §3.3–3.5 (refresh/revogação), §9 (email/jobs); OWASP Forgot Password (token aleatório, single-use, expiração, sem enumeração, rate limit); ADRs 0001/0006. Depende de A (`AdminContext` para o force-reset).

## What Changes

- **Self-service**: `POST /auth/password/forgot` (sempre `202 accepted` genérico, throttling por IP+email canônico) → cria `password_resets{token_hash,expires_at,used_at}` (só hash SHA-256, token opaco 32B, TTL 60min) → outbox `email.template` (idempotência `password-reset:{row_id}`); worker renderiza (Jinja em `infrastructure/`) e envia; após envio com sucesso o worker **redige o token do payload** (audit de envio sem segredo em repouso).
- **Boundary event**: `POST /auth/password/reset` consome com `SELECT FOR UPDATE` (single-use); sucesso = nova hash Argon2id + `tokens_valid_after=now` + `revoke_all_for_user` + **invalida demais resets pendentes** + audit. Reuse/expirado → 400 genérico.
- **Administrativo**: `POST /admin/users/{id}/force-password-reset` (staff+, `reason`) → revoga credenciais/sessões, gera recovery, audit `admin.password_reset_forced`; retorna `{status:accepted}` sem segredo.
- **Templates** `password_reset.html/txt` (`StrictUndefined`, link `FRONTEND_URL/reset?token=`); `LogEmailSender.send_template` nunca loga contexto (só to/template); dev usa SMTP+Mailpit (`make tools`); purge de expirados/pending via Taskiq/cron documentado.
- **Settings/env**: `PASSWORD_RESET_TTL_MINUTES=60`, `FRONTEND_URL` (https-only em prod).

## Capabilities

### New Capabilities

- `password-recovery`: forgot/reset com token opaco single-use, anti-enumeração, throttling, outbox+redação, Mailpit-testável.

### Modified Capabilities

- `email`: template `password_reset` + tipo `email.template` no worker.
- `audit`: `auth.password_reset_request/confirm`, `admin.password_reset_forced` com `reason+success`.
- `env-validation`: `PASSWORD_RESET_TTL_MINUTES`, `FRONTEND_URL`.

## Impact

- Novo: `infrastructure/auth/password_resets.py` (model+repo, padrão `refresh_tokens.py`), migração `0007_password_recovery`, `infrastructure/email/renderer.py`, templates, rotas forgot/reset + force-reset, `OutboxService.redact_payload`, purge.
- Alterado: `identity/service.py`, `identity/router.py`, `admin/{service,router}` (force-reset), `jobs/tasks.py` (`email.template`), `LogEmailSender`, settings, `.env.example`, DEPLOYMENT, CHANGELOG.
- Risco: janela entre enqueue e redação contém token no payload (minutos, Postgres já é fronteira de confiança); documentado no design.

## Non-goals (v2 §21)

Sem magic-link, sem OAuth ativo, sem mudar TTL de access/refresh, sem expor token em log/resposta, sem RLS.

## Acceptance criteria (Postgres+Redis reais, nunca mock)

1. Forgot com email existente e inexistente → mesmo `202`; só existente gera linha + outbox.
2. Dispatch real (broker em memória nos testes, Mailpit no slow/E2E) entrega e-mail; payload redigido após envio; log-backend nunca contém token.
3. Reset válido → 204 + sessões antigas 401 + demais pendentes invalidados; reuse/expirado → 400 genérico.
4. Force-reset (staff+reason) → `accepted`, sessões revogadas, e-mail enfileirado, audit com reason; member → 403.
5. Rajada de forgot → 429 sem vazar existência. Gates verdes.
