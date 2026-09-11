## ADDED Requirements

### Requirement: Code defaults with database overrides

The system SHALL resolve entitlements from `DEFAULT_ENTITLEMENTS` unless a grant row overrides the key for the organization.

#### Scenario: No grants configured
- **WHEN** an organization has no grant rows
- **THEN** code defaults apply and previously working flows keep working

### Requirement: Boolean and quota entitlements

The system SHALL deny when `enabled=false`, and deny creation when a `limit` is reached.

#### Scenario: Disabled feature
- **WHEN** `projects.access` is `false` for the org
- **THEN** project operations respond 403

#### Scenario: Quota reached
- **WHEN** the org already holds `projects.max` projects
- **THEN** the next create responds 403

### Requirement: Grants managed by admins

The system SHALL allow `admin+` to upsert and list grants, denying `member`.

#### Scenario: Member manages grants
- **WHEN** a `member` calls the grants endpoints
- **THEN** the API responds 403
