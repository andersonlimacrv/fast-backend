## Context

Evidências: `audit_log{tenant_id,actor,action,resource,metadata,ip,user_agent}`; `refresh_tokens{hash,family,ip,ua}`; `password_resets{hash,expiry}`; outbox com redação pós-envio (change B); `request_id` loga só método/path/status; `LogEmailSender.send_template` nunca loga contexto; `index.html` sem terceiros; `localStorage` de tokens (nota dev-only no client README).

## Goals / Non-Goals

**Goals:** garantias escritas + testes que quebram se um segredo vazar p/ audit/log.
**Non-Goals:** mudar retenção em código, DPO operacional, banner.

## Decisions

1. **Docs-first p/ LGPD, sem skill** — pesquisa (skill `find-skills` + web) não achou skill LGPD confiável; instalar qualquer coisa seria risco sem propósito (precedente do registry). Reavaliar se surgir fonte oficial.
2. **Instalar as 2 Vercel** — oficiais, 100K+ installs, necessárias p/ landing/login (a11y + React); auditoria do `SKILL.md` + pin SHA antes; `allowed-tools` restrito no registro.
3. **Varredura por substring, não por formato** — teste falha em `password|token=|secret|passwd` dentro de metadata serializada e payload redigido; evita regex frágil de JWT/opaco. `audit_metadata` inclui `reason` (proposital) — o teste permite `reason` mas proíbe segredos.
4. **`PRIVACY_CONTACT` só documentada** — sem default (cada deploy preenche); validação: string livre, nunca logada.

## Risks / Trade-offs

- [Inventário desatualiza com novas tabelas → teste de inventário? não — checklist no `tasks.md` de cada change futura + `docs-writer` dono] → processo, não código.
- [Retenção de audit sem `AUDIT_RETENTION_DAYS` → documentado como follow-up explícito] → honestidade sobre lacuna.

## Migration Plan

Sem migração. Deploy: opcional `PRIVACY_CONTACT` no env.

## Open Questions

- Nenhuma bloqueante.
