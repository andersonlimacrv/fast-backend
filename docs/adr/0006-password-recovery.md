# ADR 0006 — Recovery de senha + force-reset administrativo (testável dev/prod)

- Status: aceito (implementado e verificado na change `B-password-recovery`, 2026-09-15: 4 testes de integração + unit verdes, gates limpos)
- Data: 2026-09-15
- Referência congelada: `references/implementation_v2.md` §3.3–3.5 (refresh/revogação), §9 (email/jobs), §23
- Decisão do usuário: recovery completo e testável agora; social só extensão

## Contexto

Só existe template `welcome.*` e `EmailSender` log/SMTP (`app/infrastructure/email/sender.py:1`), sem fluxo de recovery. Recovery exige segredo de uso único, anti-enumeração, throttling e entrega confiável em dev (Mailpit) e prod (SMTP TLS). Módulos não podem importar `jinja2/aiosmtplib` (`no-provider-imports-in-modules`).

## Decisão

1. Recovery espelha refresh: token opaco 32B, só `token_hash` (SHA-256) em `password_resets{expires_at,used_at}`, TTL 60min (`PASSWORD_RESET_TTL_MINUTES`), consumo com `SELECT FOR UPDATE` + single-use, `POST /auth/password/forgot` genérico (`202` sempre) + throttling (ip, email canônico) como `login` (`identity/service.py:75`), `POST /auth/password/reset` com `tokens_valid_after=now` + `revoke_all_for_user` como `change_password` (`service.py:152-157`) **mais invalidação dos demais resets pendentes** (boundary event completo). Service levanta erros de domínio (`PasswordResetError` → 400 genérico); só `interfaces/errors.py` mapeia p/ HTTP (RULES §3).
2. Service minta + enfileira `email.template{to,subject,template,context}` (idempotência `password-reset:{row_id}`); worker (`infrastructure/jobs/tasks.py`) renderiza via `renderer.py` + envia + **redige o token do payload** (`redact_payload`: janela de segredo em repouso = minutos). `LogEmailSender.send_template` nunca loga contexto.
3. `POST /admin/users/{id}/force-password-reset` (staff+, `reason`, depende do `AdminContext` da A): revoga sessões, gera recovery, audit `admin.password_reset_forced`, retorna `{status:accepted}` sem segredo.
4. Templates `password_reset.html/txt` (`StrictUndefined`, link `FRONTEND_URL/reset?token=`); `FRONTEND_URL` https-only em prod; Mailpit pinado `major.minor` no compose dev (`make tools`); purge `password.purge` de expirados.

## Alternativas rejeitadas

- Reset via JWT assinado: sem revogação single-use sem blocklist.
- Mint do token no worker: exigiria repo no worker + estados pending; complexidade sem ganho proporcional.
- Envio síncrono no request: sem retry, request lento, duplicação sob retry do client.
- Google+GitHub ativos agora: dobra adapters/testes/segredos antes do admin existir (vai para ADR 0007 como contrato).

## Consequências

- Positivas: mesmo rigor do refresh, sem enumeração, testável com Postgres/Redis/Mailpit reais (broker em memória nos testes); OAuth futuro sem refatorar.
- Negativas: janela de minutos com token no payload do outbox (Postgres já é fronteira de confiança; documentado no design); tabela cresce sem purge (job incluído).
- Reversão: nova ADR; tabela removida em migração própria.
