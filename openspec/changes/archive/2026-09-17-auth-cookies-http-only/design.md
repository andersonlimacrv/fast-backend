## Context

Sessão SPA hoje = `localStorage` (conveniência dev, `PRIVACY.md:42`). `crudauth` tinha CSRF e não foi portado (ADR 0001). Deploy termina TLS no Caddy, SPA e API na mesma eTLD por desenho (`DEPLOYMENT.md`).

## Goals / Non-Goals

Goals: tokens fora do alcance de JS, CSRF em mutações, transição sem breaking silencioso, frontend sem `localStorage` de segredo. Non-goals: MFA, cross-site (`SameSite=None`), sessão server-side.

## Decisions

1. **`SameSite=Lax`, não `Strict`** — `Strict` quebra navegação top-level com sessão (login → volta); `Lax` + CSRF token cobre mutações. Rejeitado: `None` (exigiria `Secure` + CORS cross-site, fora do desenho).
2. **Transição dual com flag + sunset** — `AUTH_COOKIE_ENABLED` aceita header OU cookie; data de remoção do header-only registrada na change (evita breaking silencioso p/ consumidores do body). Rejeitado: virada dura (quebra clientes sem aviso).
3. **Refresh com `Path=/auth`** — cookie de refresh só viaja p/ endpoints de refresh, reduz superfície. Rejeitado: `Path=/` global.
4. **Synchronizer-token (não `Origin` check sozinho)** — `Origin` é complemento, não defesa (nem todo client envia); token exigido em mutação com cookie. Rejeitado: só `SameSite` (falha em fluxos top-level GET legados).
5. **`active_org_id` fica** — contexto, não credencial; sem valor p/ atacante sem os tokens.

## Risks / Trade-offs

- [Switch emite cookie de access até p/ chamador header-only] → inofensivo (header vence no dual-read); documentado, sem condicionar a `via_cookie` (evita ramificação).
- [XSS ainda executa JS no contexto (chamadas autenticadas via cookie)] → HttpOnly reduz a janela a XSS ativo (não roubo persistente); CSP futura (fellow-up `security-headers-csp`) aperta mais.
- [Testes e2e precisam de retrabalho de sessão] → `gotoAuthed` passa a semear cookies em vez de `localStorage`.
- [`Secure` em dev http] → flag documenta dev-sem-Secure; CI/e2e com `Secure` onde houver TLS.

## Migration Plan

Flag off por default na PR → liga em staging → sunset do header-only em change de remoção. Rollback = flag off. Sem migração de banco (cookies são transporte; `refresh_tokens` intacta).
