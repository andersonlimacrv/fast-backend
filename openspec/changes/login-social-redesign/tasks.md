# login-social-redesign — tasks

## S0 — Change + ADR

- [x] 0.1 `openspec/changes/login-social-redesign/{proposal,design,tasks}.md` +
      spec delta `specs/social-login/spec.md`
- [x] 0.2 `docs/adr/0014-generic-oidc-social-login.md`; ADR 0007 aponta para a
      ativação

## S1 — Backend: settings + contrato

- [x] 1.1 `settings.py`: bloco OIDC (`OIDC_PROVIDER`, `OIDC_DISPLAY_NAME`,
      `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`,
      `OIDC_REDIRECT_URI`, `OIDC_SCOPES`, TTLs) + validação fail-fast
- [x] 1.2 `.env.example` documentado; default flag off
- [x] 1.3 `core/contracts/social.py`: `email_verified` + `nonce` + `discover`
- [x] 1.4 `core/errors.py` + `interfaces/errors.py`: `SocialLoginError` → 400
- [x] 1.5 unit `test_settings_validation.py` + `test_oidc.py` (URL PKCE,
      discovery, profile normalization)

## S2 — Backend: adapter + estado

- [x] 2.1 `infrastructure/auth/oidc.py`: discovery cache, authorize URL,
      token exchange, UserInfo, checagem `iss`/`aud`/`sub`
- [x] 2.2 `infrastructure/auth/oidc_state.py`: Redis single-use
      (`GETDEL`) para state e grant; fail-closed
- [x] 2.3 Testes: unit do adapter (MockTransport) + integração com Redis real

## S3 — Backend: serviço + rotas

- [x] 3.1 `modules/identity/social.py`: `begin`, `complete` (link/cria),
      `exchange`; refresh via `RefreshTokenRepository`
- [x] 3.2 `modules/identity/social_router.py`: authorize/callback/exchange,
      cookie `oidc_state`, redirect de erro genérico, auditoria do login
- [x] 3.3 `main.py`: wiring condicional + `aclose` no lifespan
- [x] 3.4 `interfaces/meta.py` + `test_meta.py`: `social` no payload
- [x] 3.5 integração `test_social_login.py` (provider fake): happy path,
      link por email, email não verificado, replay de state/grant, flag off

## S4 — Frontend: transporte + contexto

- [x] 4.1 `lib/api.ts`: `getMeta.social`, `exchangeSocialCode`,
      `forgotPassword`; `services/social.ts` (URL/erros)
- [x] 4.2 `AuthContext`: `loginWithSocialCode`
- [x] 4.3 rotas: `/auth/social/callback`

## S5 — Frontend: redesign

- [x] 5.1 `components/auth/auth-shell.tsx` (split layout, tokens DESIGN.md)
- [x] 5.2 `components/auth/social-buttons.tsx` + `auth-shell`
- [x] 5.3 `login-form.tsx` redesenhado (passos, senha visível, forgot,
      a11y, loading)
- [x] 5.4 `pages/auth/Login.tsx`, `Register.tsx`, `SocialCallback.tsx`
- [x] 5.5 `login-modal.tsx` no `custom-ui/dialog` (`from="bottom"`)
- [x] 5.6 `lib/icons.tsx`: Eye/EyeOff necessários

## S6 — Verificação

- [x] 6.1 `ruff` + `mypy` + `lint-imports`; unit sem containers
- [x] 6.2 integração social com Postgres/Redis reais; suíte completa
      (263 passed)
- [x] 6.3 `npm run lint`, `tsc -b`, `npm test` (175), `npm run build`
- [x] 6.3b Playwright: axe/landing/keyboard passam; `login.png`
      regenerado via `web-e2e-baselines.yml` (commit `21fd8d8` do bot).
      Nota: `landing.png` local difere sem API no ar (badge offline) —
      pré-existente, fora do escopo.
- [x] 6.4 commits `cae26d6` (feat) + `7f27421` (fix) após pedido do
      dono; `git status --short` limpo (só `uv.lock` pré-existente, fora do
      escopo)
