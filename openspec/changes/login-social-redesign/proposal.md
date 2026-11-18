# login-social-redesign — proposal

## Why

O login da v1 é funcional mas mínimo: um formulário de dois passos dentro de um
`Card` genérico, sem recuperação de senha na tela, sem estado visual de
progresso e sem login social. O contrato social (`ADR 0007`) existe desde a
change `C-social-contract` — Protocol + tabela `linked_identities` + flag
`SOCIAL_LOGIN_ENABLED=false` — mas nunca foi ativado.

Esta change ativa um provider **OIDC genérico** (Issuer Discovery + PKCE S256)
e redesenha a experiência de autenticação do `client/` (login, registro,
callback social e modal da landing) seguindo `docs/DESIGN.md`.

## What Changes

- **Backend (ativação do contrato, sem tocar o core de identity):**
  - `app/infrastructure/auth/oidc.py`: adapter OIDC genérico
    (`authorize_url` com `state`+`nonce`+PKCE S256, `exchange_code`,
    `get_profile` via UserInfo) sobre `httpx`, disciplinado pelo
    `SocialProvider` Protocol.
  - `app/infrastructure/auth/oidc_state.py`: store Redis de `state` (single-use,
    TTL 10 min) e do grant de troca (single-use, TTL 60 s).
  - `app/modules/identity/social.py`: `SocialLoginService` — link por
    `(provider, provider_sub)` ou por **email canônico verificado**, criação de
    usuário sem `Credential`, emissão de refresh opaco + access JWT com
    rotação/reuse existentes.
  - Rotas (somente quando `SOCIAL_LOGIN_ENABLED=true`):
    `GET /auth/social/{provider}/authorize`,
    `GET /auth/social/{provider}/callback`,
    `POST /auth/social/exchange`.
  - Callback **nunca** devolve token na URL: entrega um grant opaco de uso
    único (60 s) e o SPA troca por tokens no `POST /auth/social/exchange`.
  - `GET /meta` ganha `social {enabled, provider, display_name}` (allowlist;
    nunca expõe issuer/client id/secret). Flag off = **nenhuma** rota
    `/auth/social` (preserva o spec `social-contract`).
- **Frontend (redesign completo):**
  - `AuthShell` compartilhado (split layout em `lg`, coluna única no mobile),
    tokens do `DESIGN.md`, sem cores novas.
  - `LoginForm` redesenhado: indicador de passo, mostrar/ocultar senha,
    "Forgot password?" inline (endpoint já existente), estados de erro/loading.
  - `SocialLoginButtons` lendo `/meta`, botão "Continue with <display_name>".
  - Página `/auth/social/callback` que troca o grant e entra no app.
  - Modal da landing migrado para o `custom-ui/dialog` (flip from bottom,
    DESIGN.md §7.6), reutilizando o mesmo formulário.
  - Registro com o mesmo shell + botão social.
- **Docs/testes:** ADR 0014, spec delta `social-login`, `.env.example`, testes
  unit (OIDC/URL PKCE), integração com provider fake (link, replay, email não
  verificado), vitest e axe.

## Capabilities

### New Capabilities

- `social-login`: OIDC genérico flag-gated com PKCE/state, link de conta e
  grant de troca único.

### Modified Capabilities

- `social-contract`: ativação do contrato; com a flag off o comportamento
  observável (nenhuma rota `/auth/social`) é preservado.
- `design-system-link`: login/registro passam a consumir `custom-ui/dialog` e
  o `AuthShell` documentado.

## Impact

- Backend: `settings.py`, `core/contracts/social.py`, `core/errors.py`,
  `interfaces/errors.py`, `interfaces/meta.py`, `infrastructure/auth/{oidc,
  oidc_state}.py`, `modules/identity/{social,social_router}.py`, `main.py`.
  Sem migração (tabela `linked_identities` já existe na `0008`).
- Frontend: `pages/auth/*`, `components/login-*`, `components/auth/*`,
  `contexts/AuthContext.tsx`, `lib/api.ts`, `lib/icons.tsx`, `App.tsx`.
- Config: `OIDC_*` em `.env.example`; default `SOCIAL_LOGIN_ENABLED=false`
  mantém tudo inerte.
- Segurança: `state` single-use + cookie HttpOnly de binding, PKCE S256,
  `nonce`, validação de `iss`/`aud`/`sub`, auto-link só com email verificado.

## Non-goals

- Providers específicos (Google/GitHub) com botões/cores de marca.
- Refresh-token em URL, SPA callback com tokens no fragmento, ou remoção do
  fluxo header-only.
- Tela de gerenciamento de identidades vinculadas na conta.
- MFA, SAML ou SCIM.

## Acceptance criteria

1. Flag off: `/meta.social.enabled=false`, nenhuma rota `/auth/social`, suite
   atual verde.
2. Flag on + provider fake: authorize → callback → exchange autentica; replay
   de state/grant falha; email não verificado sem link é recusado; usuário
   existente com email verificado é vinculado ao mesmo `user_id`.
3. `client`: `tsc -b`, `vitest`, `oxlint` e axe do login/registro/callback
   limpos; modal usa o flip `from="bottom"`.
4. Docs: ADR 0014 + `.env.example` + spec delta; nada de segredo em log.
