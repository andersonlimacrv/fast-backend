## MODIFIED Requirements

### Requirement: Access token carries organization context

The system SHALL include `active_org_id` in the access token as context, and SHALL issue a new access token with the requested `active_org_id` only when the user holds membership in that organization.

#### Scenario: Switch organization mints a new token
- **WHEN** an authenticated member calls `POST /auth/switch-organization` for one of their organizations
- **THEN** a new access token is issued with the requested `active_org_id`

#### Scenario: Switch without membership
- **WHEN** an authenticated user requests an organization they do not belong to
- **THEN** the API responds 403 and no token is issued
