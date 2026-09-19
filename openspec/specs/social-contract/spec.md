# social-contract Specification

## Purpose
Social login stays flag-off in v1: contract (`SocialProvider` Protocol) + `linked_identities` table exist, but no provider is wired and no `/auth/social/*` route is exposed while `SOCIAL_LOGIN_ENABLED=false`. OAuth activation (state+PKCE, routes, account-linking flow) is deferred to a dedicated change.
## Requirements
### Requirement: Contrato sem provider ativo

The system SHALL expose a `SocialProvider` Protocol in `core/contracts` plus `linked_identities(provider,provider_sub)` unique; with `SOCIAL_LOGIN_ENABLED=false` no `/auth/social` route SHALL exist.

#### Scenario: Flag off por padrão
- **WHEN** `/openapi.json` is fetched with defaults
- **THEN** no path starts with `/auth/social`.

