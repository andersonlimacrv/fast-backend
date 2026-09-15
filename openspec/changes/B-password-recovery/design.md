## Context

Recovery exige segredo de uso único, anti-enumeração, throttling e entrega confiável dev/prod. O padrão de refresh (`refresh_tokens.py`: hash-only, `FOR UPDATE`, reuse→revoga, `tokens_valid_after`) é o modelo. Módulos não podem importar `jinja2/aiosmtplib` (`no-provider-imports-in-modules`): renderização e SMTP vivem em `infrastructure/` (worker), problema resolvido com o tipo `email.template`.

## Goals / Non-Goals

**Goals:** mesmo rigor do refresh; token nunca em log/resposta além do e-mail; testável sem mock (broker em memória + Mailpit).
**Non-Goals:** magic-link, OAuth, alterar access/refresh.

## Decisions

1. **Service minta, worker renderiza/envia/redige** — service (módulo) cria hash + enfileira `email.template{to,subject,template,context}`; `tasks.py` (infra) renderiza via `renderer.py` + envia + `redact_payload`. Alternativa rejeitada: mint no worker (exigiria repo no worker + estados pending; complexidade sem ganho proporcional). Janela de token no payload = minutos até redação, documentada.
2. **Redação pós-envio** — `OutboxService.redact_payload` substitui contexto por `{redacted:true}` mantendo `to/template/sent_at`. Log-backend nunca recebe contexto.
3. **Boundary event completo** — reset válido invalida sessões (`tokens_valid_after` + `revoke_all`, como `change_password`) **e** demais resets pendentes (`used_at=now`). Sem isso, token paralelo vazado sobrevive.
4. **Forgot sempre 202** — existente ou não; auditoria só quando usuário existe (evita log-spam de enumeração, que já é throttled).
5. **Force-reset ≠ forgot** — operação privilegiada com `reason`, revoga primeiro e retorna `accepted` sem segredo (OWASP: admin não vê credencial).
6. **Throttling como contador** — cada forgot incrementa `(ip, pwd-reset:{email})`; limite = `login_max_attempts` existente. Simples, sem nova infra.

## Risks / Trade-offs

- [SMTP fora no momento do dispatch → retry do outbox (`attempts`/`dead`)] → coberto pelo mecanismo existente; alerta se `dead` crescer.
- [`FRONTEND_URL` mal configurado gera link quebrado → validação https-only em prod + teste de render] → template testado com `StrictUndefined`.
- [Token no payload entre enqueue e redação → leitura de DB nessa janela] → janela de minutos; Postgres já é fronteira de confiança total; documentado aqui.

## Migration Plan

`0007_password_recovery`: tabela `password_resets` + índices (`token_hash` unique, `expires_at`, `user_id`). Expand-only; downgrade dropa. Deploy junto da A (ordem 0006→0007).

## Open Questions

- Purge: Taskiq beat vs cron SQL — implementação escolhe beat com `outbox.dispatch`-like (`password.purge`), documentado no tasks da change.
