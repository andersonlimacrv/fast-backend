# login-social-redesign — design

## Context

`ADR 0007` preparou o contrato (`SocialProvider`) e a tabela
`linked_identities`, mas deixou a ativação para uma change dedicada. O login
atual (`client/src/components/login-form.tsx`) é um formulário de dois passos
sem recuperação de senha na tela, e a landing usa um `Dialog` Base-UI sem a
coreografia de overlay do `DESIGN.md` §7.6.

## Decisions

1. **OIDC genérico, não Google/GitHub.** Um único adapter
   (`OIDC_ISSUER` + discovery) cobre Google, Keycloak, Auth0, Entra ID e
   qualquer IdP OIDC sem código específico. `provider` = slug configurado
   (`OIDC_PROVIDER`, default `oidc`), usado na URL. Rejeitado: providers
   hardcoded (duplica fluxo e testes, adiciona marca ao design system).
2. **Code flow com PKCE S256 + `state` + `nonce`.** O backend guarda o
   `code_verifier` no Redis (TTL 10 min) e o `state` é single-use (`GETDEL`).
   Um cookie `HttpOnly` `oidc_state` (`Path=/auth/social`, `SameSite=Lax`)
   amarra o callback ao mesmo navegador — sem ele, um atacante poderia induzir
   login na conta dele (login CSRF).
3. **Tokens nunca na URL.** O callback entrega
   `FRONTEND_URL/auth/social/callback?code=<grant>`; o grant é opaco,
   single-use, TTL 60 s, e o SPA troca por `POST /auth/social/exchange`. Isso
   funciona nos dois modos de sessão (header-only e cookies) sem colocar
   refresh token em histórico/log/referrer. Rejeitado: fragmento com tokens
   (vaza em logs de browser/extensões) e cookie-only (quebraria header mode).
4. **Link de conta só com email verificado.** Ordem: identidade
   `(provider, provider_sub)` existente → login; senão, se o IdP afirma
   `email_verified`, procura usuário pelo email canônico e vincula; senão cria
   usuário sem `Credential` (não há senha para adivinhar). Sem email
   verificado e sem link = recusa genérica. Rejeitado: auto-link sem
   verificação (account takeover por email não confirmado).
5. **Reuso do core de sessão.** `RefreshTokenRepository.mint` + 
   `mint_access_token` + `tokens_valid_after` são os mesmos do login por senha.
   O callback só pré-gera `family_id`; o refresh nasce no exchange, então um
   grant abandonado não deixa refresh válido órfão.
6. **Flag off = superfície zero.** As rotas sociais só são incluídas em
   `main.py` quando `SOCIAL_LOGIN_ENABLED=true`; `/meta` informa
   `social.enabled=false` e o SPA não renderiza o botão. Preserva literalmente
   o spec `social-contract` (nenhum path `/auth/social` com a flag off).
7. **Redesign ancorado no DESIGN.md.** `AuthShell` usa apenas tokens
   (`bg-card`, `border-border`, `text-muted-foreground`, `ring`), um único
   protagonista visual (o formulário), foco `ring-2`, alvos ≥ 24 px e
   `prefers-reduced-motion` herdado do `custom-ui/dialog`. Sem gradientes,
   bege/terracota, CAPS decorativo ou emoji.

## Flow

```text
SPA ──click──▶ GET /auth/social/oidc/authorize
                 │  state+verifier+nonce no Redis; cookie oidc_state
                 ▼
              IdP (PKCE S256)
                 │  code+state
                 ▼
GET /auth/social/oidc/callback ──▶ exchange_code ──▶ userinfo
                 │  link/cria usuário; grant Redis 60 s
                 ▼
302 FRONTEND_URL/auth/social/callback?code=<grant>
                 │
SPA ──POST /auth/social/exchange {code}──▶ access JWT + refresh opaco
```

## Risks / Trade-offs

- **UserInfo como fonte de identidade.** Validamos `iss`/`aud`/`sub`/`nonce` do
  `id_token` de forma consistente (decode sem assinatura), mas a prova de
  identidade vem do UserInfo obtido com o access token trocado no token
  endpoint autenticado (client secret + PKCE). Validar a assinatura RS256
  exigiria JWKS + `cryptography`; fica como hardening futuro documentado.
- **Redis como store efêmero.** Já é dependência de auth (throttling). Falha
  do Redis = recusa fail-closed (400), nunca login sem state.
- **Auto-link por email verificado** confia no IdP; é o comportamento padrão
  de SSO e está documentado no ADR 0014.
- **Sem refresh em grant abandonado** (decisão 5); o usuário repete o login.

## Migration

Nenhuma: `linked_identities` já existe (`0008_social_identities`). O modelo
`LinkedIdentity` já vive em `infrastructure/auth/social.py`.
