## ADDED Requirements

### Requirement: Contrato sem provider ativo

The system SHALL expose a `SocialProvider` Protocol in `core/contracts` plus `linked_identities(provider,provider_sub)` unique; with `SOCIAL_LOGIN_ENABLED=false` no `/auth/social` route SHALL exist.

#### Scenario: Flag off por padrão
- **WHEN** `/openapi.json` is fetched with defaults
- **THEN** no path starts with `/auth/social`.
