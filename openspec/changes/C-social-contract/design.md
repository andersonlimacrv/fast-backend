## Context

Micro-change de preparação (decisão aprovada): OAuth ativo adiado; contrato adianta o desenho sem custo de superfície. Ativação futura = adapter em `infrastructure/` + rotas `/auth/social/*` com `state`+PKCE e link por email canônico, sem tocar identity core.

## Decisions

1. **Protocol em `core/contracts`** — fronteira explícita, testável com fakes; provider real (OIDC discovery, JWKS) só na change de ativação.
2. **Model em `infrastructure/auth`** — segue `refresh_tokens.py` (segredos/identidades em infra, não em módulos).
3. **Flag off sem rota** — `SOCIAL_LOGIN_ENABLED=false`; composição não registra nada.

## Risks

- Tabela sem uso até ativação → custo zero além da migração; documentado.
