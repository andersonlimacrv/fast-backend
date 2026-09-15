## Why

Login social (Google/GitHub) foi adiado no ADR 0001 e confirmado como "só extensão" na decisão aprovada: ativar OAuth agora dobraria superfície (state/PKCE, segredos, link de contas) antes do control plane existir. Mas o recovery (B) e o admin (A) devem nascer sem bloquear o futuro: contrato + tabela agora, provider depois. Referência: `references/implementation_v2.md` §3.6; ADR 0001. Depende de B (migração `0008` após `0007`).

## What Changes

- `app/core/contracts/social.py`: `SocialProvider` Protocol (`authorize_url`, `exchange_code`, `get_profile`) — módulos nunca importam OAuth direto (`no-provider-imports-in-modules`).
- `app/infrastructure/auth/social.py`: model `LinkedIdentity{user_id,provider,provider_sub,email,created_at}` (unique `(provider,provider_sub)`), sem lógica de provider.
- Migração `0008_social_identities`; `SOCIAL_LOGIN_ENABLED=false` sem rota; triagem de skill OAuth em `SKILLS-REGISTRY.md` (`avaliada`, sem instalar).

## Capabilities

### New Capabilities

- `social-contract`: contrato + tabela para login social futuro, inerte por padrão.

## Impact

- Novo: 2 arquivos + 1 migração + 1 spec delta. Zero rota, zero segredo novo, zero comportamento.

## Non-goals (v2 §21)

Sem Google/GitHub ativo, sem `/auth/social/*`, sem link automático de contas, sem sessão nova.

## Acceptance criteria

1. Migração aplica e reverte limpo; `SOCIAL_LOGIN_ENABLED=false` não expõe rota (`/openapi.json` sem `/auth/social`).
2. `ruff+mypy+lint-imports+pytest` verdes; `bandit/pip-audit/gitleaks` limpos.
