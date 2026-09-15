# ADR 0007 — Contrato social adiado (login social futuro)

- Status: aceito (implementado na change `C-social-contract`, 2026-09-15: contrato + tabela + migração, sem rota — verificado via `/openapi.json`)
- Data: 2026-09-15
- Referência congelada: `references/implementation_v2.md` §3.6 (extensões de auth)
- Contexto upstream: ADR 0001 adiou OAuth; decisão aprovada: "só preparar extensão"

## Contexto

Ativar Google/GitHub agora dobraria superfície (OAuth `state`/PKCE, segredos, link de contas, JWKS) antes do control plane existir. Mas recovery (B) e admin (A) não devem bloquear o futuro.

## Decisão

1. `app/core/contracts/social.py`: `SocialProvider` Protocol (`authorize_url`, `exchange_code`, `get_profile`). Módulos nunca importam OAuth direto (`no-provider-imports-in-modules`).
2. `app/infrastructure/auth/social.py`: model `LinkedIdentity{user_id,provider,provider_sub,email,created_at}` (unique `(provider,provider_sub)`), sem lógica de provider — segue `refresh_tokens.py`.
3. `SOCIAL_LOGIN_ENABLED=false`, sem rota (`/openapi.json` não contém `/auth/social`); ativação futura = adapter em `infrastructure/` + rotas com `state`+PKCE e link por email canônico, sem tocar identity core.

## Alternativas rejeitadas

- Ativar Google OIDC agora: escopo + segredos + testes antes do admin pronto.
- Model em `app/modules/`: identidades vinculadas são segredo de auth como refresh — vivem em `infrastructure/auth`.

## Consequências

- Positivas: custo zero além da migração; OAuth futuro sem refatorar.
- Negativas: tabela sem uso até ativação.
- Reversão: nova ADR + migração de remoção.
