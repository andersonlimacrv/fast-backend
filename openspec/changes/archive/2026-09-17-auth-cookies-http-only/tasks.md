## 1. Backend — emissão e leitura

- [x] 1.1 `Set-Cookie` em login/refresh/switch (`HttpOnly; Secure; SameSite=Lax`, `Path` restrito, `Max-Age` = TTL)
- [x] 1.2 Leitura dual (header OU cookie) atrás de `AUTH_COOKIE_ENABLED`; remoção do header-only = change futura dedicada (sunset sem data fictícia)
- [x] 1.3 Logout expira os cookies; `refresh_tokens.ip/ua` seguem gravados

## 2. CSRF

- [x] 2.1 Emissão do synchronizer-token + exigência em mutações autenticadas por cookie (403 sem token)
- [x] 2.2 `Secure` amarrado a HTTPS no runbook (`DEPLOYMENT.md` +pt-BR, Caddy); dev sem Secure documentado

## 3. Frontend

- [x] 3.1 `session.ts`: modo `VITE_AUTH_COOKIES` (access em memória, refresh nunca em JS, CSRF do cookie legível); `credentials: "include"`; `SESSION_EVENT` intacto; header-mode byte-idêntico por default
- [x] 3.2 `active_org_id` permanece (não-segredo); boot sem token tenta refresh silencioso via cookie

## 4. Testes + docs

- [x] 4.1 Backend: 12 unit + 9 integration (Postgres/Redis reais); CSRF 403/200; transição dual; logout limpa
- [x] 4.2 Vitest 105/105 (modo cookie sem storage); e2e `cookie-auth.spec.ts` ×4 (HttpOnly/CSRF/refresh vazio/403-200); `PRIVACY.md` (+pt-BR) sem "never ship as-is"; e2e isolado com `AUTH_COOKIE_ENABLED=true`
- [x] 4.3 Gates 2026-09-17: `pytest` unit 122+integration 104, `tsc+build`, vitest, e2e 18/18, `oxlint`, `ruff`, `mypy`, `bandit -ll`
