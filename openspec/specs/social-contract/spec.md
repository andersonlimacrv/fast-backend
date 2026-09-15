# social-contract Specification

## Purpose
Contrato inerte para login social futuro (change C-social-contract, ADR 0007): provider OAuth/OIDC ativado depois, sem refatorar identity.

## Requirements
### Requirement: Contrato sem provider ativo

The system SHALL expose `SocialProvider` Protocol in `core/contracts` plus `linked_identities(provider,provider_sub)` unique; with `SOCIAL_LOGIN_ENABLED=false` no `/auth/social` route SHALL exist.

#### Scenario: Flag off por padrão
- **WHEN** `/openapi.json` is fetched with defaults
- **THEN** no path starts with `/auth/social`.
