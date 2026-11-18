# ADR 0014 — Login social via OIDC genérico

- Status: aceito (change `login-social-redesign`, 2026-10-22)
- Data: 2026-10-22
- Substitui parcialmente: `ADR 0007` (o contrato e a tabela continuam válidos;
  a decisão "sem provider ativo" é revogada)
- Completado por: `ADR 0015` (validação de assinatura do `id_token` via
  JWKS/RS256; a decisão "validação fica pendente" está revogada)

## Contexto

O ADR 0007 deixou o contrato `SocialProvider` e a tabela
`linked_identities` prontos, com `SOCIAL_LOGIN_ENABLED=false` e nenhuma rota.
A v1.0.0 foi entregue; agora o login social entra como extensão opt-in, sem
travar o deploy padrão (que segue sem provider).

## Decisão

1. **Um adapter OIDC genérico** em `infrastructure/auth/oidc.py`, configurado
   por `OIDC_ISSUER` (discovery), `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` e
   `OIDC_REDIRECT_URI`. Módulos dependem só do Protocol em
   `core/contracts/social.py` (`no-provider-imports-in-modules` intacto).
2. **Authorization Code + PKCE S256 + state + nonce.** `state` e
   `code_verifier` ficam no Redis, single-use; um cookie `HttpOnly`
   `oidc_state` (`Path=/auth/social`, `SameSite=Lax`) amarra o callback ao
   navegador (anti login-CSRF).
3. **Grant de troca único em vez de tokens na URL.** O callback redireciona
   para `FRONTEND_URL/auth/social/callback?code=<grant>` (TTL 60 s) e o SPA
   troca em `POST /auth/social/exchange` pelo par de tokens padrão. Refresh só
   nasce no exchange, então grant abandonado não deixa sessão válida órfã.
4. **Link por identidade ou email verificado.** `(provider, provider_sub)` é a
   chave primária de login; auto-link por email canônico só com
   `email_verified=true`; sem isso, recusa genérica. Usuário novo nasce sem
   `Credential` (sem senha).
5. **Flag off = superfície zero.** As rotas só são incluídas com
   `SOCIAL_LOGIN_ENABLED=true`; `/meta.social` informa o estado sem vazar
   issuer/client id/secret.

## Alternativas rejeitadas

- **Providers específicos (Google/GitHub)**: duplica fluxo, testes e adiciona
  marca/cores ao design system; o OIDC genérico cobre ambos via discovery.
- **Tokens no fragmento da URL**: vazam em histórico, extensões e logs de
  browser; o grant opaco tem o mesmo custo de implementação.
- **Auto-link sem `email_verified`**: permite account takeover quando o IdP
  devolve email não confirmado.
- **Validar assinatura do `id_token` (JWKS/RS256) agora**: exige dependência
  criptográfica e cache de chaves; a prova de identidade já vem do UserInfo
  obtido com o code trocado no token endpoint autenticado. Fica como hardening
  futuro documentado no design da change.

## Consequências

- Positivas: SSO opt-in sem novo módulo nem migração; reaproveita refresh
  opaco, rotação, `tokens_valid_after` e auditoria; SPA e API compartilham o
  mesmo contrato de sessão.
- Negativas: `cryptography` no runtime (adicionada na change
  `oidc-id-token-signature`); validação de assinatura do `id_token`
  implementada no ADR 0015.
- Trocar `OIDC_ISSUER` mantendo o mesmo `OIDC_PROVIDER` reinterpretaria os
  `provider_sub` antigos: ao migrar de IdP, troque também o slug do provider.
- Reversão: `SOCIAL_LOGIN_ENABLED=false` remove todas as rotas; os vínculos
  existentes ficam inertes na tabela.
