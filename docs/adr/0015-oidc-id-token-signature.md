# ADR 0015 — Verificação de assinatura do `id_token` (JWKS/RS256)

- Status: aceito (change `oidc-id-token-signature`, 2026-11-18)
- Data: 2026-11-18
- Completa: `ADR 0014` (a decisão "validação de assinatura fica pendente" está revogada)

## Contexto

O ADR 0014 deixou o `id_token` como checagem de consistência (decode sem
assinatura), com a prova de identidade vindo do UserInfo. Era um gap
explicito e documentado. Esta change o fecha.

## Decisão

1. **RS256 apenas.** Padrão dominante dos IdPs server-side; qualquer outro
   `alg` (incluindo `none`) é recusado — sem negociação de algoritmo com o
   header controlado pelo atacante.
2. **JWKS via discovery, cache em processo, refetch no `kid` desconhecido.**
   `jwks_uri` vem do documento de discovery já validado (issuer exato);
   rotação coberta pelo refetch único. Sem Redis, sem thread de TTL.
3. **Claims completas em um ponto só:** `jwt.decode` com `audience`,
   `issuer`, `algorithms=["RS256"]`, `leeway=60`, `require=["exp", "iat",
   "sub"]`, mais `sub` cruzado com o UserInfo e `nonce` contra o state.
4. **Nova dep `cryptography`** (PyJWT exige para RS256). Pin
   `cryptography>=44`, auditada no `pip-audit`.
5. **Erros genéricos:** toda falha vira `SocialLoginError("identity
   provider token invalid")` — sem oráculo.

## Alternativas rejeitadas

- `ES256` junto: mais caminhos de código sem deploy que precise; follow-up
  trivial.
- `JWKClient` do PyJWT: esconde a política de cache/rotação; o fetch
  explícito mantém o fail-closed visível.
- Cache JWKS no Redis: peça móvel a mais para dado que muda raramente.

## Consequências

- Positivas: `id_token` vira assertion verificada (OIDC Core §3.1.3.7).
- Negativas: `cryptography` no runtime; JWKS por worker em multi-processo
  (um JSON pequeno por IdP — negligível).
- Reversão: voltar ao decode não-verificado exige nova ADR (não recomendado).
