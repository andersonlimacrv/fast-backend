## Why

Access/refresh vivem em `localStorage` (`client/src/services/session.ts:6-26`) — qualquer XSS rouba a sessão e persiste além do XSS. Os próprios docs declaram `dev convenience only — never ship as-is; use HttpOnly/Secure + CSRF` (`docs/PRIVACY.md:42`). Não existe nenhum código de cookie. Sem isso, prod com SPA = XSS→takeover. É o pré-requisito honesto para produção (bloqueia Trilha 4/LGPD-prod).

## What Changes

Backend:
- Login/refresh/switch-organization passam a emitir `Set-Cookie` (`access_token`, `refresh_token`): `HttpOnly; Secure; SameSite=Lax (ou Strict)` + `Path` restrito (`/auth` p/ refresh) + `Max-Age` alinhado ao TTL.
- Leitura Bearer mantida em transição (flag `AUTH_COOKIE_ENABLED` + período dual: aceita header OU cookie), com data de remoção do header-only.
- CSRF synchronizer-token (o que o `crudauth` tinha e o ADR 0001 registra como não-portado): token legível por JS (`X-CSRF-Token` em cookie `SameSite=Lax` não-HttpOnly OU endpoint) exigido em mutações quando autenticado por cookie.
- Logout limpa os cookies (`Set-Cookie` expirado); `refresh_tokens.ip/ua` continuam gravados.

Frontend (`client/`, change exige `frontend-implementer` pós-aprovação):
- `session.ts` deixa de persistir tokens: access em memória, refresh nunca toca JS; `fetch` com `credentials: "include"`; expiração continua via `SESSION_EVENT`.
- `active_org_id` segue em `localStorage` (não é segredo).

Testes: XSS simulado (JS não lê cookie HttpOnly), CSRF sem token → 403, com token → 200, transição header→cookie, logout limpa.

## Capabilities

### New Capabilities

- `auth-cookies`: sessão SPA por cookie HttpOnly + CSRF.

### Modified Capabilities

- `jwt-access`, `refresh-rotation`, `client-architecture` (sessão), `privacy-docs` (remover o "never ship as-is").

## Impact

- Alterados: routers/responses de auth, settings (`AUTH_COOKIE_*`, `CSRF_*`), `client/src/services/*` + chamadas fetch, testes backend (client real) + vitest, `docs/PRIVACY.md` (+pt-BR), `.env.example`, `DEPLOYMENT.md` (Secure exige HTTPS — amarrar ao Caddy).
- Quebra cliente que lia tokens do body para guardar: documentado como breaking da transição (major do frontend).

## Non-goals

MFA, `SameSite=None` + CORS cross-site (SPA e API mesma eTLD por desenho), sessões server-side (refresh continua opaco rotativo, sem estado extra).

## Acceptance criteria

1. `document.cookie` nunca contém os tokens; mutação sem `X-CSRF-Token` (autenticado por cookie) → 403.
2. Fluxo login → navegação → refresh silencioso → logout funciona só com cookies.
3. Flag off = comportamento atual (transição segura); `bandit/pip-audit`, `ruff`, `mypy`, suites backend + vitest + e2e verdes.
